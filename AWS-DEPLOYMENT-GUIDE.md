# 🚀 AWS Ubuntu 24.04 Deployment Guide - Vanta X Enterprise FMCG Platform

## 📋 Quick Start for AWS EC2 Ubuntu 24.04

This guide provides step-by-step instructions for deploying the **Vanta X Enterprise FMCG Platform** on AWS EC2 Ubuntu 24.04 LTS servers.

---

## 🎯 Prerequisites

### **AWS Requirements**
- AWS Account with EC2 access
- EC2 instance running Ubuntu 24.04 LTS
- Minimum instance type: **t3.medium** (2 vCPU, 4GB RAM)
- Recommended: **t3.large** or higher for production
- 50GB+ EBS storage
- Security group with appropriate ports open

### **Required Ports**
- **22** - SSH access
- **80** - HTTP (redirects to HTTPS)
- **443** - HTTPS
- **4000** - Backend API (internal)

---

## 🏗️ AWS EC2 Setup

### **1. Launch EC2 Instance**

```bash
# Using AWS CLI (optional)
aws ec2 run-instances \
    --image-id ami-0e86e20dae90224e1 \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxxxxx \
    --subnet-id subnet-xxxxxxxxx \
    --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":50,"VolumeType":"gp3"}}]' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=VantaX-Enterprise-FMCG}]'
```

### **2. Configure Security Group**

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP (redirects to HTTPS) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS access |
| Custom TCP | TCP | 4000 | 10.0.0.0/8 | Backend API (internal) |

### **3. Connect to Instance**

```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@your-instance-public-ip
```

---

## 🚀 Automated Deployment

### **Step 1: Download Platform Files**

```bash
# Create deployment directory
mkdir -p ~/vantax-deployment
cd ~/vantax-deployment

# Download the platform files (replace with your method)
# Option 1: If you have the files locally, use SCP
scp -i your-key.pem enterprise-*.* ubuntu@your-instance-ip:~/vantax-deployment/

# Option 2: If files are in a repository
git clone your-repository-url .

# Option 3: Download directly (if hosted)
wget https://your-domain.com/enterprise-backend.js
wget https://your-domain.com/enterprise-frontend.html
wget https://your-domain.com/enterprise-app.js
wget https://your-domain.com/aws-ubuntu-deploy.sh
```

### **Step 2: Run Automated Deployment**

```bash
# Make the deployment script executable
chmod +x aws-ubuntu-deploy.sh

# Run the deployment script
sudo ./aws-ubuntu-deploy.sh
```

The script will automatically:
- ✅ Detect AWS environment and instance details
- ✅ Install all required dependencies (Node.js 20.x, PostgreSQL 16, Redis, Nginx)
- ✅ Configure security (UFW firewall, fail2ban)
- ✅ Set up the application with PM2 process management
- ✅ Configure Nginx with SSL/TLS
- ✅ Set up AWS CloudWatch monitoring
- ✅ Create automated backup system
- ✅ Configure management scripts

---

## 🎯 Post-Deployment Steps

### **1. Verify Deployment**

```bash
# Check platform status
vantax-enterprise status

# Run health checks
vantax-enterprise health

# View logs
vantax-enterprise logs
```

### **2. Access the Platform**

- **Web Application:** `https://your-instance-public-ip`
- **API Endpoint:** `https://your-instance-public-ip/api/v2`
- **Health Check:** `https://your-instance-public-ip/health`

### **3. Configure Domain Name (Optional)**

If you have a domain name:

```bash
# Update Nginx configuration
sudo nano /etc/nginx/sites-available/vantax-enterprise

# Change server_name from IP to your domain
server_name your-domain.com;

# Get Let's Encrypt certificate
sudo certbot --nginx -d your-domain.com

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔧 Management Commands

### **Platform Control**
```bash
vantax-enterprise start      # Start the platform
vantax-enterprise stop       # Stop the platform
vantax-enterprise restart    # Restart the platform
vantax-enterprise status     # Check status
```

### **Monitoring & Maintenance**
```bash
vantax-enterprise logs       # View backend logs
vantax-enterprise health     # Run health checks
vantax-enterprise backup     # Create backup
vantax-enterprise ssl-renew  # Renew SSL certificate
```

### **System Information**
```bash
# View system resources
htop

# Check disk usage
df -h

# View network connections
netstat -tulpn

# Check firewall status
sudo ufw status
```

---

## 📊 AWS CloudWatch Integration

The deployment automatically configures CloudWatch monitoring:

### **Metrics Collected**
- CPU utilization
- Memory usage
- Disk usage
- Network statistics
- Application performance

### **Log Groups Created**
- `/vantax/enterprise/backend-error`
- `/vantax/enterprise/backend-out`
- `/vantax/enterprise/nginx-access`
- `/vantax/enterprise/nginx-error`

### **View Logs in AWS Console**
1. Go to CloudWatch in AWS Console
2. Navigate to "Log groups"
3. Select the appropriate log group
4. View real-time logs and metrics

---

## 🔒 Security Features

### **Firewall Configuration**
- UFW firewall enabled with minimal required ports
- fail2ban configured for intrusion prevention
- Rate limiting on API endpoints

### **SSL/TLS Security**
- Automatic SSL certificate generation
- TLS 1.2 and 1.3 support
- Security headers configured
- HSTS enabled

### **Application Security**
- Process isolation with dedicated user
- Input validation and sanitization
- CORS configuration
- SQL injection protection

---

## 📈 Performance Optimization

### **For Production Workloads**

1. **Upgrade Instance Type**
   ```bash
   # Stop instance and change to larger type
   # Recommended: t3.large, t3.xlarge, or c5.large
   ```

2. **Enable Auto Scaling**
   ```bash
   # Create Auto Scaling Group with multiple instances
   # Use Application Load Balancer for distribution
   ```

3. **Database Optimization**
   ```bash
   # Consider RDS PostgreSQL for production
   # Enable read replicas for scaling
   ```

4. **Caching Layer**
   ```bash
   # Consider ElastiCache Redis for production
   # Enable CloudFront CDN for static assets
   ```

---

## 🔄 Backup and Recovery

### **Automated Backups**
- Daily backups at 2 AM UTC
- Retention: 7 days locally
- Optional S3 upload if AWS CLI configured

### **Manual Backup**
```bash
# Create immediate backup
vantax-enterprise backup

# View backup files
ls -la /opt/vantax-backups/
```

### **Restore from Backup**
```bash
# Stop the platform
vantax-enterprise stop

# Extract backup
cd /opt/vantax-backups
tar -xzf vantax_backup_YYYYMMDD_HHMMSS.tar.gz

# Restore database
sudo -u postgres psql vantax_enterprise < backup_folder/database.sql

# Restore application files
cp -r backup_folder/application/* /opt/vantax-enterprise/

# Start the platform
vantax-enterprise start
```

---

## 🚨 Troubleshooting

### **Common Issues**

1. **Platform Won't Start**
   ```bash
   # Check logs
   vantax-enterprise logs
   
   # Check PM2 status
   sudo -u vantax bash -c "cd /opt/vantax-enterprise && pm2 status"
   
   # Restart services
   vantax-enterprise restart
   ```

2. **SSL Certificate Issues**
   ```bash
   # Check certificate
   openssl x509 -in /etc/ssl/vantax/vantax.crt -text -noout
   
   # Regenerate self-signed certificate
   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
       -keyout /etc/ssl/vantax/vantax.key \
       -out /etc/ssl/vantax/vantax.crt
   ```

3. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test database connection
   sudo -u postgres psql vantax_enterprise -c "SELECT version();"
   ```

4. **High Memory Usage**
   ```bash
   # Check memory usage
   free -h
   
   # Restart PM2 processes
   sudo -u vantax bash -c "cd /opt/vantax-enterprise && pm2 restart all"
   ```

### **Log Locations**
- Application logs: `/var/log/vantax-enterprise/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`
- PM2 logs: `sudo -u vantax bash -c "cd /opt/vantax-enterprise && pm2 logs"`

---

## 🎯 Production Checklist

### **Before Going Live**

- [ ] Configure proper domain name
- [ ] Set up Let's Encrypt SSL certificate
- [ ] Configure AWS security groups properly
- [ ] Set up CloudWatch alarms
- [ ] Configure automated backups to S3
- [ ] Test disaster recovery procedures
- [ ] Set up monitoring alerts
- [ ] Configure log retention policies
- [ ] Review security settings
- [ ] Test all functionality

### **Recommended AWS Services**

- **RDS PostgreSQL** - Managed database
- **ElastiCache Redis** - Managed caching
- **Application Load Balancer** - Load balancing
- **CloudFront** - CDN for static assets
- **Route 53** - DNS management
- **Certificate Manager** - SSL certificates
- **Systems Manager** - Configuration management
- **CloudTrail** - Audit logging

---

## 📞 Support

### **Health Monitoring**
```bash
# Continuous health monitoring
watch -n 30 'vantax-enterprise health'

# System resource monitoring
watch -n 5 'free -h && df -h'
```

### **Performance Monitoring**
- AWS CloudWatch dashboards
- Built-in health check endpoints
- PM2 monitoring interface
- Nginx status monitoring

---

## 🎊 Success!

Your **Vanta X Enterprise FMCG Platform** is now running on AWS Ubuntu 24.04 with:

✅ **Enterprise-grade security**  
✅ **Automated monitoring and backups**  
✅ **SSL/TLS encryption**  
✅ **Process management with PM2**  
✅ **AWS CloudWatch integration**  
✅ **Multi-company architecture**  
✅ **AI/ML platform with 10 models**  
✅ **Real-time analytics and insights**  

**Access your platform at:** `https://your-instance-public-ip`

---

*🎯 Vanta X - Enterprise FMCG Platform optimized for AWS Ubuntu 24.04*