import { Router, Request, Response } from 'express';
import {
  db,
  User,
  Product,
  Category,
  Collection,
  Order,
  OrderItem,
  DiscountCode,
  StoreSettings,
  hashPassword,
  verifyPassword
} from './db.js';
import {
  signToken,
  verifyToken,
  requireAuth,
  requireAdmin,
  checkLoginRateLimit,
  AuthenticatedRequest
} from './auth.js';
import {
  sendWelcomeEmail,
  sendWhatsAppWelcomeMessage,
  sendOrderConfirmationEmail
} from './notifications.js';

export const apiRouter = Router();

// ==========================================
// 1. PUBLIC STORE SETTINGS & CONFIG
// ==========================================
apiRouter.get('/settings', (req: Request, res: Response) => {
  const settings = db.get('settings');
  const resendActive = Boolean(process.env.RESEND_API_KEY);
  const whatsappActive = Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  res.json({
    ...settings,
    resendIntegrationConfigured: resendActive,
    whatsappIntegrationConfigured: whatsappActive
  });
});

apiRouter.put('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body as Partial<StoreSettings>;
  const current = db.get('settings');
  const updated = { ...current, ...updates };
  db.update('settings', updated);
  res.json({ success: true, settings: updated });
});

// ==========================================
// 2. CUSTOMER AUTHENTICATION
// ==========================================
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, phone, password, whatsappConsent } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const users = db.get('users');

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: String(name).trim(),
    email: cleanEmail,
    phone: phone ? String(phone).trim() : undefined,
    passwordHash: hash,
    salt,
    role: 'customer',
    provider: 'local',
    whatsappConsent: Boolean(whatsappConsent),
    createdAt: new Date().toISOString()
  };

  db.mutate(data => {
    data.users.push(newUser);
  });

  // Automatically trigger personalized welcome email
  const welcomeEmailLog = await sendWelcomeEmail({
    recipientEmail: newUser.email,
    recipientName: newUser.name
  });

  // Automatically trigger optional WhatsApp welcome message if phone provided & consented
  let welcomeWaLog = null;
  if (newUser.phone) {
    welcomeWaLog = await sendWhatsAppWelcomeMessage({
      phoneNumber: newUser.phone,
      recipientName: newUser.name,
      hasConsent: Boolean(newUser.whatsappConsent)
    });
  }

  const token = signToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role
  });

  // Return clean customer profile without sensitive credentials
  const safeProfile = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    createdAt: newUser.createdAt
  };

  res.status(201).json({
    message: 'Account created successfully! Welcome message dispatched.',
    token,
    user: safeProfile,
    notifications: {
      email: welcomeEmailLog,
      whatsapp: welcomeWaLog
    }
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || 'anonymous';

  if (!checkLoginRateLimit(`cust_login_${ip}`)) {
    res.status(429).json({ error: 'Too many login attempts. Please wait 1 minute before trying again.' });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// OAuth Endpoint for Google Sign-In
apiRouter.post('/auth/google', async (req: Request, res: Response) => {
  const { email, name, googleId, phone, whatsappConsent } = req.body;
  if (!email || !String(email).includes('@')) {
    res.status(400).json({ error: 'Valid Google email address is required / يرجى توفير بريد إلكتروني صالح' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const userName = String(name || cleanEmail.split('@')[0] || 'Google User').trim();
  const users = db.get('users');
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  let isNew = false;

  if (!user) {
    isNew = true;
    const fakePass = hashPassword(`google_${Date.now()}_${Math.random()}`);
    user = {
      id: `usr_g_${Date.now()}`,
      name: userName,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      passwordHash: fakePass.hash,
      salt: fakePass.salt,
      role: 'customer',
      provider: 'google',
      whatsappConsent: Boolean(whatsappConsent),
      createdAt: new Date().toISOString()
    };
    db.mutate(data => data.users.push(user!));
    await sendWelcomeEmail({ recipientEmail: user.email, recipientName: user.name });
    if (user.phone && user.whatsappConsent) {
      await sendWhatsAppWelcomeMessage({
        phoneNumber: user.phone,
        recipientName: user.name,
        hasConsent: true
      });
    }
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.json({
    message: isNew
      ? `Welcome to KAIRØ DISTRICT, ${user.name}! / مرحباً بك، تم إنشاء حسابك بنجاح عبر Google`
      : `Welcome back, ${user.name}! / أهلاً بك من جديد، تم تسجيل الدخول بنجاح عبر Google`,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

apiRouter.post('/auth/apple', async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const cleanEmail = (email || `user_${Date.now()}@privaterelay.appleid.com`).toLowerCase();
  const userName = name || 'Apple User';

  const users = db.get('users');
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    const fakePass = hashPassword(`apple_${Date.now()}_${Math.random()}`);
    user = {
      id: `usr_a_${Date.now()}`,
      name: userName,
      email: cleanEmail,
      passwordHash: fakePass.hash,
      salt: fakePass.salt,
      role: 'customer',
      provider: 'apple',
      whatsappConsent: false,
      createdAt: new Date().toISOString()
    };
    db.mutate(data => data.users.push(user!));
    await sendWelcomeEmail({ recipientEmail: user.email, recipientName: user.name });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Password reset simulation / email verification
apiRouter.post('/auth/reset-password-request', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.get('users').find(u => u.email.toLowerCase() === cleanEmail);

  if (user) {
    const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const log: any = {
      id: `notif_reset_${Date.now()}`,
      channel: 'email',
      recipient: cleanEmail,
      subject: 'Password Reset Verification Code',
      content: `Your verification code is: ${resetToken}. Enter this code on the password reset page to update your credentials.`,
      status: 'delivered_simulated',
      providerNote: 'Password reset code generated and logged.',
      createdAt: new Date().toISOString()
    };
    db.mutate(data => data.notifications.unshift(log));
  }

  // Always respond with success to prevent user enumeration
  res.json({
    message: 'If an account matches that email address, a password reset verification code has been dispatched.'
  });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not found.' });
    return;
  }
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      mustChangePassword: req.user.mustChangePassword,
      createdAt: req.user.createdAt
    }
  });
});

// ==========================================
// 3. ADMIN AUTHENTICATION & ACCESS CONTROL
// ==========================================
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const ip = req.ip || 'admin_ip';

  if (!checkLoginRateLimit(`admin_login_${ip}`)) {
    res.status(429).json({ error: 'Too many admin login attempts. Please wait 1 minute.' });
    return;
  }

  if (!username || !password) {
    res.status(400).json({ error: 'Username/Email and password are required.' });
    return;
  }

  const query = String(username).trim().toLowerCase();
  const users = db.get('users');

  // Check username match ("Mustafa") or email match ("admin@kairodistrict.com")
  const admin = users.find(
    u => u.role === 'admin' && (u.name.toLowerCase() === query || u.email.toLowerCase() === query)
  );

  if (!admin || !verifyPassword(password, admin.passwordHash, admin.salt)) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
    mustChangePassword: admin.mustChangePassword
  });

  res.json({
    token,
    mustChangePassword: Boolean(admin.mustChangePassword),
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

apiRouter.post('/admin/change-password', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const adminId = req.user!.id;
  const users = db.get('users');
  const admin = users.find(u => u.id === adminId);

  if (!admin) {
    res.status(404).json({ error: 'Admin user not found.' });
    return;
  }

  if (currentPassword && !verifyPassword(currentPassword, admin.passwordHash, admin.salt)) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  const { hash, salt } = hashPassword(newPassword);

  db.mutate(data => {
    const userToUpdate = data.users.find(u => u.id === adminId);
    if (userToUpdate) {
      userToUpdate.passwordHash = hash;
      userToUpdate.salt = salt;
      userToUpdate.mustChangePassword = false;
    }
  });

  res.json({
    success: true,
    message: 'Password successfully updated. Temporary password cleared.'
  });
});

apiRouter.get('/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const products = db.get('products');
  const orders = db.get('orders');
  const users = db.get('users');

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalInventory = products.reduce((sum, p) => sum + p.totalStock, 0);
  const lowStockCount = products.filter(p => p.totalStock <= 10).length;

  res.json({
    totalRevenue,
    ordersCount: orders.length,
    activeProductsCount: products.filter(p => p.status === 'Published').length,
    customersCount: users.filter(u => u.role === 'customer').length,
    totalInventory,
    lowStockCount,
    recentOrders: orders.slice(0, 5)
  });
});

// ==========================================
// 4. PRODUCTS & CATALOG
// ==========================================
apiRouter.get('/products', (req: Request, res: Response) => {
  const { category, collection, search, sort, includeDrafts } = req.query;
  let products = [...db.get('products')];

  // Unless requested by admin, only show Published
  if (includeDrafts !== 'true') {
    products = products.filter(p => p.status === 'Published');
  }

  if (category && category !== 'All') {
    products = products.filter(
      p => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (collection && collection !== 'All') {
    products = products.filter(
      p => p.collection.toLowerCase() === String(collection).toLowerCase()
    );
  }

  if (search) {
    const query = String(search).toLowerCase();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sort === 'price_desc') {
    products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(products);
});

apiRouter.get('/products/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const products = db.get('products');
  const product = products.find(p => p.id === idOrSlug || p.slug === idOrSlug);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  // Related products from the same category or collection
  const related = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.collection === product.collection) && p.status === 'Published')
    .slice(0, 4);

  res.json({ product, related });
});

apiRouter.post('/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    price,
    salePrice,
    category,
    collection,
    images,
    sizes,
    colors,
    variants,
    status,
    isFeatured,
    isNewArrival,
    details
  } = req.body;

  if (!name || !price || !category) {
    res.status(400).json({ error: 'Name, price, and category are required.' });
    return;
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const productVariants = variants && variants.length > 0 ? variants : [
    { size: 'M', color: colors?.[0] || 'Black', stock: 20 }
  ];

  const totalStock = productVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name: String(name),
    slug: `${slug}-${Date.now().toString().slice(-4)}`,
    description: description || '',
    price: Number(price),
    salePrice: salePrice ? Number(salePrice) : null,
    category: String(category),
    collection: collection || 'Core Essentials',
    images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/product_hoodie_heavyweight_1791725317370.jpg'],
    sizes: sizes || ['S', 'M', 'L', 'XL'],
    colors: colors || ['Black'],
    variants: productVariants,
    totalStock,
    status: status || 'Published',
    isFeatured: Boolean(isFeatured),
    isNewArrival: Boolean(isNewArrival),
    details: Array.isArray(details) ? details : ['100% Egyptian Combed Cotton', 'Made in Cairo, Egypt'],
    createdAt: new Date().toISOString()
  };

  db.mutate(data => {
    data.products.unshift(newProduct);
  });

  res.status(201).json(newProduct);
});

apiRouter.put('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedProduct: Product | null = null;

  db.mutate(data => {
    const idx = data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const existing = data.products[idx];
      const mergedVariants = updates.variants || existing.variants;
      const totalStock = mergedVariants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);

      updatedProduct = {
        ...existing,
        ...updates,
        variants: mergedVariants,
        totalStock,
        price: updates.price !== undefined ? Number(updates.price) : existing.price,
        salePrice: updates.salePrice !== undefined ? (updates.salePrice ? Number(updates.salePrice) : null) : existing.salePrice
      };
      data.products[idx] = updatedProduct!;
    }
  });

  if (!updatedProduct) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  res.json(updatedProduct);
});

apiRouter.delete('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let deleted = false;

  db.mutate(data => {
    const idx = data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      data.products.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  res.json({ success: true, message: 'Product deleted.' });
});

// ==========================================
// 5. CATEGORIES & COLLECTIONS
// ==========================================
apiRouter.get('/categories', (req: Request, res: Response) => {
  res.json(db.get('categories'));
});

apiRouter.post('/admin/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required.' });
    return;
  }

  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description
  };

  db.mutate(data => data.categories.push(newCat));
  res.status(201).json(newCat);
});

apiRouter.get('/collections', (req: Request, res: Response) => {
  res.json(db.get('collections'));
});

apiRouter.post('/admin/collections', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, season } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Collection name is required.' });
    return;
  }

  const newCol: Collection = {
    id: `col_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    season
  };

  db.mutate(data => data.collections.push(newCol));
  res.status(201).json(newCol);
});

// ==========================================
// 6. DISCOUNT CODES
// ==========================================
apiRouter.post('/discounts/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Discount code required.' });
    return;
  }

  const cleanCode = String(code).trim().toUpperCase();
  const discounts = db.get('discounts');
  const discount = discounts.find(d => d.code.toUpperCase() === cleanCode && d.isActive);

  if (!discount) {
    res.status(404).json({ error: 'Invalid or expired promotional code.' });
    return;
  }

  const numericSubtotal = Number(subtotal) || 0;
  if (numericSubtotal < discount.minSpend) {
    res.status(400).json({
      error: `Minimum spend of EGP ${discount.minSpend.toLocaleString()} required for code ${discount.code}.`
    });
    return;
  }

  const discountAmount = Math.round((numericSubtotal * discount.percentage) / 100);

  res.json({
    valid: true,
    code: discount.code,
    percentage: discount.percentage,
    discountAmount,
    message: `${discount.percentage}% discount applied!`
  });
});

apiRouter.get('/admin/discounts', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get('discounts'));
});

apiRouter.post('/admin/discounts', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { code, percentage, minSpend } = req.body;
  if (!code || !percentage) {
    res.status(400).json({ error: 'Code and percentage are required.' });
    return;
  }

  const newDiscount: DiscountCode = {
    id: `disc_${Date.now()}`,
    code: String(code).toUpperCase().trim(),
    percentage: Number(percentage),
    minSpend: Number(minSpend) || 0,
    isActive: true,
    usedCount: 0
  };

  db.mutate(data => data.discounts.push(newDiscount));
  res.status(201).json(newDiscount);
});

// ==========================================
// 7. ORDERS & CHECKOUT
// ==========================================
apiRouter.post('/orders', async (req: Request, res: Response) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    discountCode,
    paymentMethod
  } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
    res.status(400).json({ error: 'Complete shipping details and at least one product item are required.' });
    return;
  }

  // Calculate items subtotal and verify products
  const products = db.get('products');
  const settings = db.get('settings');
  let subtotal = 0;
  const verifiedItems: OrderItem[] = [];

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      res.status(400).json({ error: `Product with ID ${item.productId} was not found.` });
      return;
    }

    const price = prod.salePrice ?? prod.price;
    const qty = Math.max(1, Number(item.quantity) || 1);
    const lineTotal = price * qty;
    subtotal += lineTotal;

    verifiedItems.push({
      productId: prod.id,
      productName: prod.name,
      image: prod.images[0] || '',
      size: item.size || 'M',
      color: item.color || 'Black',
      quantity: qty,
      unitPrice: price,
      totalPrice: lineTotal
    });
  }

  // Calculate discount
  let discountAmount = 0;
  if (discountCode) {
    const cleanCode = String(discountCode).trim().toUpperCase();
    const discount = db.get('discounts').find(d => d.code.toUpperCase() === cleanCode && d.isActive);
    if (discount && subtotal >= discount.minSpend) {
      discountAmount = Math.round((subtotal * discount.percentage) / 100);
      db.mutate(data => {
        const d = data.discounts.find(x => x.id === discount.id);
        if (d) d.usedCount += 1;
      });
    }
  }

  // Calculate Egypt governorate shipping fee
  const gov = (shippingAddress.governorate || '').toLowerCase();
  let shippingFee = settings.shippingRates.cairoGiza; // default Cairo

  if (gov.includes('alex')) {
    shippingFee = settings.shippingRates.alexandria;
  } else if (gov.includes('aswan') || gov.includes('luxor') || gov.includes('asyut') || gov.includes('sohag') || gov.includes('qena')) {
    shippingFee = settings.shippingRates.upperEgypt;
  } else if (gov.includes('suez') || gov.includes('port said') || gov.includes('ismailia') || gov.includes('mansoura') || gov.includes('gharbia') || gov.includes('sharqia')) {
    shippingFee = settings.shippingRates.deltaCanal;
  }

  // Free shipping check
  if (subtotal >= settings.shippingRates.freeShippingThreshold) {
    shippingFee = 0;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const orderNumber = `KD-${Math.floor(10000 + Math.random() * 90000)}`;

  // Optional authenticated user id
  let userId: string | null = req.body.userId || null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenPayload = verifyToken(authHeader.substring(7));
    if (tokenPayload) userId = tokenPayload.userId;
  }

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderNumber,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items: verifiedItems,
    subtotal,
    discountAmount,
    discountCode: discountCode || undefined,
    shippingFee,
    totalAmount,
    paymentMethod: paymentMethod === 'card_instapay' ? 'card_instapay' : 'cod',
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mutate database: save order and adjust inventory
  db.mutate(data => {
    data.orders.unshift(newOrder);

    // Decrement inventory stock
    for (const item of verifiedItems) {
      const prod = data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.totalStock = Math.max(0, prod.totalStock - item.quantity);
        const variant = prod.variants.find(v => v.size === item.size && v.color === item.color);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
        }
        if (prod.totalStock === 0) {
          prod.status = 'Out of Stock';
        }
      }
    }
  });

  // Dispatch order confirmation email notification
  await sendOrderConfirmationEmail({
    orderNumber,
    customerName,
    customerEmail,
    totalAmount,
    itemsCount: verifiedItems.length
  });

  res.status(201).json(newOrder);
});

apiRouter.get('/orders/my-orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userEmail = req.user!.email.toLowerCase();

  const userOrders = db.get('orders').filter(
    o => o.userId === userId || o.customerEmail.toLowerCase() === userEmail
  );

  res.json(userOrders);
});

apiRouter.get('/orders/:idOrNumber', (req: Request, res: Response) => {
  const { idOrNumber } = req.params;
  const orders = db.get('orders');
  const order = orders.find(
    o => o.id === idOrNumber || o.orderNumber.toUpperCase() === idOrNumber.toUpperCase()
  );

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  res.json(order);
});

apiRouter.get('/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get('orders'));
});

apiRouter.put('/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status value.' });
    return;
  }

  let updatedOrder: Order | null = null;
  db.mutate(data => {
    const o = data.orders.find(ord => ord.id === id);
    if (o) {
      o.status = status;
      o.updatedAt = new Date().toISOString();
      updatedOrder = o;
    }
  });

  if (!updatedOrder) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  res.json(updatedOrder);
});

// ==========================================
// 8. NOTIFICATION DELIVERY LOGS
// ==========================================
apiRouter.get('/admin/notifications', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.get('notifications'));
});

// ==========================================
// 9. NEWSLETTER
// ==========================================
apiRouter.post('/newsletter', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !String(email).includes('@')) {
    res.status(400).json({ error: 'Valid email address required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  db.mutate(data => {
    if (!data.subscribers.some(s => s.email.toLowerCase() === cleanEmail)) {
      data.subscribers.push({
        id: `sub_${Date.now()}`,
        email: cleanEmail,
        createdAt: new Date().toISOString()
      });
    }
  });

  res.json({ success: true, message: 'Subscribed to VIP Streetwear Drops!' });
});
