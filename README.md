# UDP DDOS BOT

***MADE BY @SYZDARK***

**Hello There Again!
Im @syzdark Known as the developer of
VoxelCord Im Here to show 
u another side project Again Lol**

## How to install

### PC INSTALLATION

### **How to Install Node.js on Windows (Beginner-Friendly)**  

#### **Step 1: Download Node.js**  
1. Open your web browser and go to [https://nodejs.org](https://nodejs.org).  
2. You will see two versions:  
   - **LTS (Long-Term Support)** – Recommended for most users (stable).  
   - **Current** – Has the latest features but may be less stable.  
3. Click **LTS** to download the installer (`.msi` file).  

#### **Step 2: Install Node.js**  
1. Open the downloaded `.msi` file.  
2. Click **Next** and accept the License Agreement.  
3. Choose the installation path (default is fine).  
4. Ensure **"Add to PATH"** is checked (this allows you to use Node.js in the command prompt).  
5. Click **Install** and wait for the installation to finish.  
6. Click **Finish** once done.  

#### **Step 3: Verify the Installation**  
1. Open **Command Prompt** (Press `Win + R`, type `cmd`, and hit Enter).  
2. Type the following command and press **Enter**:  
   ```sh
   node -v
   ```
   - This should display the installed Node.js version (e.g., `v18.17.1`).  
3. Check if npm (Node Package Manager) is installed by typing:  
   ```sh
   npm -v
   ```
   - It should return a version number (e.g., `9.6.7`).  

### **How to Install Dependencies (crypto, dgram, discord.js) in Node.js on Windows**  

#### **Step 1: Open Command Prompt**  
Press `Win + R`, type `cmd`, and hit **Enter** to open Command Prompt.  

#### **Step 2: Initialize a Node.js Project**  
Before installing dependencies, create a project folder and initialize a Node.js project:  
```sh
mkdir my-node-project
cd my-node-project
npm init -y
```
This will create a `package.json` file for your project.  

#### **Step 3: Install Dependencies**  
Now, install the required dependencies using `npm install`:  

```sh
npm install discord.js
```
- This installs the **discord.js** library for interacting with the Discord API.  

```sh
npm install dgram
```
- This installs **dgram**, which is used for working with UDP sockets.  

#### **Step 4: Using Built-in crypto Module**  
- **crypto** is built into Node.js, so you **don’t** need to install it separately.  
- You can import it directly in your JavaScript file like this:  
  ```js
  const crypto = require('crypto');
  ```

#### **Step 5: Verify Installation**  
Check the `node_modules` folder to confirm that `discord.js` and `dgram` were installed.  
You can also list installed packages with:  
```sh
npm list --depth=0
```
It should show `discord.js` and `dgram`.  

# How to installl on a VPS

## (reccommended Option)

### **How to Install Node.js and Dependencies on an Ubuntu VPS**  

If you have an Ubuntu-based VPS, follow these steps to install **Node.js**, **npm**, and your required dependencies (**discord.js**, **dgram**).  

---

### **Step 1: Connect to Your VPS**  
Use **SSH** to connect to your VPS. Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux) and run:  

```sh
ssh username@your-vps-ip
```
- Replace `username` with your VPS username.  
- Replace `your-vps-ip` with the actual VPS IP address.  

If it's your first time connecting, type `yes` and press **Enter** to continue.  

---

### **Step 2: Install Node.js and npm**  

#### **Option 1: Install Node.js from Ubuntu Repositories (Easiest)**
```sh
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm -y
```
- Check installed versions:  
  ```sh
  node -v
  npm -v
  ```
- The version might be outdated. If you need the latest version, use **Option 2**.

#### **Option 2: Install Latest Node.js (Recommended)**
1. Add NodeSource repository for the latest **LTS (18.x)** version:  
   ```sh
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
2. Verify installation:  
   ```sh
   node -v
   npm -v
   ```
---

### **Step 3: Install Dependencies (discord.js, dgram)**  
1. Create a project folder and navigate into it:  
   ```sh
   mkdir my-project && cd my-project
   ```
2. Initialize a Node.js project:  
   ```sh
   npm init -y
   ```
3. Install required dependencies:  
   ```sh
   npm install discord.js dgram
   ```
4. Since `crypto` is built into Node.js, you **don’t need to install it**. Just require it in your script:  
   ```js
   const crypto = require('crypto');
   ```

---

### **Step 4: Run Your Node.js Application**  
If you have a script file like `bot.js`, run it with:  
```sh
node bot.js
```
However, if you close the terminal, the bot will stop running. To keep it running in the background, use one of these methods:  

#### **Method 1: Run in Background Using nohup**  
```sh
nohup node bot.js > output.log 2>&1 &
```
- This keeps your bot running even after logging out.  

#### **Method 2: Use PM2 (Recommended for Long-Term Running Bots)**  
1. Install PM2 globally:  
   ```sh
   npm install -g pm2
   ```
2. Start your bot with PM2:  
   ```sh
   pm2 start bot.js
   ```
3. Make PM2 auto-start on reboot:  
   ```sh
   pm2 save
   pm2 startup
   ```

---

### **Step 5: (Optional) Enable a Firewall Rule for Your App**  
If your bot uses UDP (for `dgram`) or HTTP/WebSockets, allow the required ports:  

Example:  
```sh
sudo ufw allow 3000/tcp  # Allow HTTP server on port 3000
sudo ufw allow 443/tcp   # Allow HTTPS
sudo ufw allow 22/tcp    # Allow SSH (Important!)
sudo ufw enable          # Enable firewall
```

---
# levels of TCP attack
***Nexus Reaper***
Summary:
10 GB per second
600 GB per minute
36 TB per hour

***Astral REAPER***
Summary:
Per Second: 650 MB
Per Minute: 39 GB
Per Hour: 2.34 TB
