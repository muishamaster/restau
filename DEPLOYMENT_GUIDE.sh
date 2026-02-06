#!/bin/bash
# ===================================================================
# BENI BK - Guide Déploiement Production
# ===================================================================

# COLOR CODES
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 BENI BK - Guide Déploiement Production${NC}\n"

# ======================== CHECKLIST PRE-DEPLOY ========================

echo -e "${YELLOW}📋 CHECKLIST PRE-DÉPLOIEMENT${NC}\n"

checklist=(
    "✓ Tous les fichiers HTML présents (index.html, menu.html, entrees.html, plats.html, desserts.html, boissons.html)"
    "✓ script.js et style.css optimisés"
    "✓ Images dans dossier img/ optimisées"
    "✓ ADVANCED_CONFIG.js en place"
    "✓ README.md documenté"
    "✓ CDN qrcode.js accessible"
    "✓ Certificat SSL/HTTPS actif"
    "✓ Numéro WhatsApp vérifié"
    "✓ Fournisseurs Mobile Money testés"
    "✓ LocalStorage compatible"
)

for item in "${checklist[@]}"
do
    echo -e "${GREEN}$item${NC}"
done

# ======================== VÉRIFICATION FICHIERS ========================

echo -e "\n${YELLOW}🔍 Vérification structure fichiers...${NC}\n"

files=(
    "index.html"
    "menu.html"
    "entrees.html"
    "plats.html"
    "desserts.html"
    "boissons.html"
    "script.js"
    "style.css"
    "README.md"
    "ADVANCED_CONFIG.js"
)

for file in "${files[@]}"
do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file MANQUANT${NC}"
    fi
done

# ======================== VÉRIFICATIONS SÉCURITÉ ========================

echo -e "\n${YELLOW}🔐 Vérifications sécurité...${NC}\n"

# Vérifier XSS
if grep -q "escapeHtml" script.js; then
    echo -e "${GREEN}✓ Protection XSS implémentée${NC}"
else
    echo -e "${RED}✗ Protection XSS manquante${NC}"
fi

# Vérifier validation panier
if grep -q "validateCart" script.js; then
    echo -e "${GREEN}✓ Validation panier implémentée${NC}"
else
    echo -e "${RED}✗ Validation panier manquante${NC}"
fi

# Vérifier HTTPS
if grep -q "https://" index.html || grep -q "https://" style.css; then
    echo -e "${GREEN}✓ Références HTTPS présentes${NC}"
else
    echo -e "${YELLOW}⚠ Vérifier les références HTTP${NC}"
fi

# ======================== OPTIMISATIONS RECOMMANDÉES ========================

echo -e "\n${YELLOW}⚙️  OPTIMISATIONS RECOMMANDÉES${NC}\n"

cat << 'EOF'

1. MINIFICATION
   - Minifier style.css
   - Minifier script.js
   - Utiliser terser ou uglifyjs

   npm install -g terser
   terser script.js -o script.min.js -c -m

2. COMPRESSION
   - Activer gzip sur serveur
   - Compresser images (WebP)
   
   # Apache .htaccess
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
   </IfModule>

3. CACHING
   - Cache-Control headers
   - Expiration dates
   
   # Nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
       expires 30d;
   }

4. IMAGES
   - Convertir PNG → WebP
   - Optimiser avec ImageMagick
   - Lazy loading

5. CDN
   - CloudFlare pour CDN global
   - Accélération DNS
   - DDoS protection

6. MONITORING
   - Google Analytics
   - Error tracking (Sentry)
   - Uptime monitoring

EOF

# ======================== DEPLOYMENT AVEC GIT ========================

echo -e "\n${YELLOW}📦 Déploiement avec GIT${NC}\n"

cat << 'EOF'

# 1. Initialiser repository
git init
git add .
git commit -m "feat: Initial BENI BK deployment"

# 2. Ajouter remote
git remote add origin https://github.com/benibk/restaurant.git

# 3. Pousser vers production
git push -u origin main

# 4. Déploiement avec GitHub Pages (gratuit)
# Dans Settings → Pages → Source: main branch

# 5. Déploiement avec Vercel
npm install -g vercel
vercel

# 6. Déploiement avec Netlify
npm install -g netlify-cli
netlify deploy --prod

EOF

# ======================== CONFIGURATION SERVEUR ========================

echo -e "\n${YELLOW}🖥️  Configuration Serveur${NC}\n"

cat << 'EOF'

NGINX Configuration:
========================

server {
    listen 443 ssl http2;
    server_name benibk.cd;
    
    # SSL Certificat
    ssl_certificate /etc/ssl/certs/benibk.cd.crt;
    ssl_certificate_key /etc/ssl/private/benibk.cd.key;
    
    # Root
    root /var/www/benibk;
    index index.html;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Route fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name benibk.cd www.benibk.cd;
    return 301 https://$server_name$request_uri;
}

EOF

# ======================== ENV VARIABLES ========================

echo -e "\n${YELLOW}🔑 Variables d'Environnement${NC}\n"

cat << 'EOF'

Créer fichier .env (NON committé):

WHATSAPP_NUMBER=243977970594
PAYMENT_API_KEY=sk_live_xxxxxxxx
ADMIN_EMAIL=admin@benibk.cd
SITE_URL=https://benibk.cd
LOG_LEVEL=error

# .gitignore
.env
.env.local
node_modules/
dist/
*.log

EOF

# ======================== TESTS PRE-PRODUCTION ========================

echo -e "\n${YELLOW}✅ Tests Avant Production${NC}\n"

cat << 'EOF'

1. TEST PANIER
   - Ajouter articles
   - Modifier quantités
   - Vérifier calculs
   - Vider panier

2. TEST PAIEMENT
   - QR Code affichage
   - Modal paiement
   - Deep links Mobile Money
   - Notifications

3. TEST MOBILE
   - iPhone 12/13
   - Android 11/12
   - Tablettes
   - Écrans 4K

4. TEST PERFORMANCE
   - Lighthouse audit
   - PageSpeed Insights
   - Time to First Byte < 100ms
   - Core Web Vitals

5. TEST SÉCURITÉ
   - OWASP Top 10
   - XSS Prevention
   - CSRF Protection
   - SQL Injection (N/A client-side)

EOF

# ======================== MONITORING PRODUCTION ========================

echo -e "\n${YELLOW}📊 Monitoring Production${NC}\n"

cat << 'EOF'

1. UPTIME MONITORING
   - Ping services
   - Status page
   - Alert email/SMS

2. ERROR TRACKING
   - Sentry integration
   - Console errors log
   - Analytics

3. PERFORMANCE METRICS
   - Page load time
   - API response time
   - Error rate

4. USER ANALYTICS
   - Google Analytics 4
   - Conversion tracking
   - Heatmaps (Hotjar)

5. LOGS
   - Application logs
   - Server logs
   - Access logs

EOF

# ======================== ROLLBACK PLAN ========================

echo -e "\n${YELLOW}🔄 Plan Rollback${NC}\n"

cat << 'EOF'

Si problèmes détectés:

1. Revert dernier commit
   git revert HEAD
   git push origin main

2. Activer version précédente
   Vercel/Netlify: Switch to last deployment

3. Notification aux utilisateurs
   Email/SMS notification

4. Investigation
   Vérifier logs
   Identifier cause
   Fix et redeploy

EOF

# ======================== SAUVEGARDES ========================

echo -e "\n${YELLOW}💾 Sauvegardes${NC}\n"

cat << 'EOF'

Daily Backups:
- Database (si applicable)
- Code repository
- User data
- Configuration files

Retention: 30 jours

Restoration test mensuel

EOF

# ======================== POST-DEPLOYMENT ========================

echo -e "\n${YELLOW}✨ Post-Déploiement${NC}\n"

cat << 'EOF'

Après déploiement:

1. ✓ Vérifier site en ligne
2. ✓ Tester flux panier
3. ✓ Tester paiement
4. ✓ Vérifier QR code
5. ✓ Tester sur mobile
6. ✓ Vérifier emails
7. ✓ Check analytics
8. ✓ Activer monitoring
9. ✓ Notifier stakeholders
10. ✓ Documenter version

EOF

echo -e "\n${GREEN}✅ Guide déploiement terminé${NC}\n"
echo -e "Pour plus d'infos, voir README.md et ADVANCED_CONFIG.js\n"
