# **Drawing Application** 🎨✏️  

An **Angular-based** web application where users with different roles (**Writer**, **Manager**, **Admin**) collaborate on creating and managing labeled drawings. Uses **Firebase Firestore (Database) + Hosting** and a **separate Google Sign-In** for authentication.  

![App Preview](![Schermafbeelding 2025-04-23 120229](https://github.com/user-attachments/assets/de6e3350-b8a8-45ce-a2a6-aedae20969d3)
) *(Replace with actual screenshot)*  

---

## **🔑 Authentication & Access Control**  
- **Google Sign-In** (independent of Firebase Auth)  
- **403 (Access Denied)** – Shown if a user tries to access unauthorized pages.  
- **404 (Not Found)** – Custom 404 error page.  
- **Role Review** – New users land here after login, waiting for **Admin/Manager** role assignment.  

---

## **👥 User Roles & Pages**  

### **👤 Everyone (Logged In)**  
| Page | Description |
|------|-------------|
| **Login** | Google Sign-In (custom implementation, not Firebase Auth). |
| **Role Review** | Temporary page until a Manager/Admin assigns a role. |

### **✍️ Writer**  
| Page | Description |
|------|-------------|
| **Topic Overview** | Lists available topics. Writers select one to start drawing. |
| **Drawing** | Canvas to draw and submit labels for the selected topic. |
| **Submissions Overview** | View, edit, or delete their own drawings. |

### **📋 Manager**  
| Page | Description |
|------|-------------|
| **Topic Overview** | Same as Writer, but with additional management options. |
| **Manager Overview** | View and manage all drawings submitted by Writers. |
| **Topic Management** | Create/update/delete **topics** and their **labels**. |
| **Writer Management** | Approve new Writers and manage their roles. |

### **🛠️ Admin**  
| Page | Description |
|------|-------------|
| **Manager Management** | Manage all users (assign roles: **Writer, Manager, Admin**). |

---

## **🛠️ Technologies Used**  
- **Frontend**: Angular, TypeScript  
- **Database**: Firebase Firestore  
- **Hosting**: Firebase Hosting  
- **Authentication**: Custom Google Sign-In (separate from Firebase Auth)  

---

## **🚀 Setup & Deployment Guide**  

### **Prerequisites**  
- Node.js (v16+)  
- Angular CLI (`npm install -g @angular/cli`)  
- Firebase account (for Firestore & Hosting)  

### **1️⃣ Clone the Repository**  
```bash
git clone https://github.com/your-repo/label-drawing-app.git
cd label-drawing-app
```

### **2️⃣ Install Dependencies**  
```bash
npm install
```

### **3️⃣ Configure Firebase (Database & Hosting)**  
1. Set up **Firestore Database** in Firebase Console.  
2. Update Firebase config in:  
   - `src/environments/environment.ts` (dev)  
   - `src/environments/environment.prod.ts` (prod)  

### **4️⃣ Configure Google Sign-In**  
- Update Google OAuth credentials in:  
  - `src/app/google_signin.service.ts`  
  - Any related config files for your custom auth flow.  

### **5️⃣ Run Locally**  
```bash
ng serve
```
Visit `http://localhost:4200`.  

### **6️⃣ Deploy to Firebase Hosting**  
```bash
ng build --production
firebase deploy
```

---

## **📂 Project Structure**  
```
src/
├── app/
│   ├── services/          # Firebase Firestore services & data models  
│   ├── google_signin/     # Custom Google Sign-In implementation  
│   ├── app.routes.ts      # Routing configuration  
│   └── ...                # Components for each page  
```

---

## **📜 License**  
MIT  

---

**❓ Need Help?**  
Open a GitHub issue or contact me!  

*(Replace placeholder links, screenshots, and config details with your actual project info.)*  

🎨 **Built with Angular & Firebase** | 🔌 **Custom Google Auth**
