# Production Secrets for GitHub

Add the following secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions` → `New repository secret`):

## Database Configuration

### `DATABASE_URL`
```
mysql://zonecalc_user:ZoneCalcUserPass123!@34.38.121.159:3306/zoneCalculator
```

**Note**: This is a public IP connection. For production, you should:
- Configure Cloud SQL Proxy or Private IP for better security
- Use Google Cloud Secret Manager for credentials

## Authentication Configuration

### `NEXTAUTH_SECRET`
```
HZduNK7ssRF0rxjvb3CqoXuMygYb8+kinxYZAdsT3pg=
```

### `NEXTAUTH_URL`
```
https://zone-calculator-pro-643174162787.europe-west1.run.app
```
(Confirmed via Cloud Run Dashboard)

## AI Configuration

### `GEMINI_API_KEY`
```
AIzaSyBAtPB1p3GafGVQwkFpAmO2f5lx2RvFelA
```

---

## Already Configured ✅

These were already set up:

- ✅ `GCP_PROJECT_ID`: `gen-lang-client-0322370238`
- ✅ `GCP_SA_KEY`: (from `gcp-key.json`)

---

## Post-Deployment Steps

After the first successful deployment:

1. **Update `NEXTAUTH_URL`**:
   - Get your Cloud Run service URL from the deployment output
   - Update the GitHub secret to match: `https://your-service-XXXX.run.app`

2. **Push Prisma Schema**:
   - Connect to Cloud SQL and run migrations to create tables
   - Optionally: Run `seed_db.js` to populate initial data

3. **Whitelist Cloud Run IPs** (Optional for better security):
   - Configure Cloud SQL to only accept connections from Cloud Run service

---

## Cloud SQL Details

- **Instance Name**: `zone-calc-db`
- **Database**: `zoneCalculator`
- **Username**: `zonecalc_user`
- **Password**: `ZoneCalcUserPass123!`
- **Public IP**: `34.38.121.159`
- **Region**: `europe-west1-b`
