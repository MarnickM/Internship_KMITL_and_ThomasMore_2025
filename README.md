# **Hand Drawing Application** 🎨✏️  

An **Angular-based** web application where users with different roles (**Writer**, **Manager**, **Admin**) collaborate on creating and managing labeled drawings. Uses **Firebase Firestore (Database) + Hosting** and a **separate Google Sign-In** for authentication.  

![Schermafbeelding 2025-04-23 120229](https://github.com/user-attachments/assets/de6e3350-b8a8-45ce-a2a6-aedae20969d3)


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
| **Drawing** | Canvas to draw and submit drawings for the selected label and topic. |
| **Submissions Overview** | View, edit, or delete their own drawings. |

### **📋 Manager**  
| Page | Description |
|------|-------------|
| **Topic Overview** | Same as Writer, but with additional management options. |
| **Manager Overview** | View and manage all drawings submitted by Writers that belong to a topic created by the Manager currently logged in. |
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
- **Authentication**: Custom Google Sign-In with Angular Guards (separate from Firebase Auth)  

---

## **🛢 Database Design**  
![UML_picture](https://github.com/user-attachments/assets/2def59e8-3e47-4418-abfa-4962ea22f3b7)

---

## **🚀 Setup & Deployment Guide**  

### **Prerequisites**  
- Node.js (v16+)  
- Angular CLI (`npm install -g @angular/cli`)  
- Firebase account (for Firestore & Hosting)  

### **1️⃣ Clone the Repository**  
```bash
git clone https://github.com/MarnickM/Thai_Internship_2025.git
cd Thai_Internship_2025
```

### **2️⃣ Install Dependencies**  
```bash
npm install
```

### **3️⃣ Configure Firebase (Database & Hosting)**  
#### **Database**
1. Set up **Firestore Database** in Firebase Console.
2. Add config provided by Firebase in src/app/app.config.ts
#### **Hosting**
1. Set up **Firebase Hosting** in Firebase Console.
2. install Firebase CLI in angular project
3. run `firebase login` and `firebase init` in the CLI console
4. Update Firebase config in:  
   - `src/firebase.json`
   - `.firebaserc`

### **4️⃣ Configure Google Sign-In**  
- Create a Google OAuth project in the Google Console
- Update Google OAuth credentials in:
  - `src/app/app.config.ts` & `src/environments/environment.ts` (you may need to create the env file yourself since this won't be pushed to Github)

### **5️⃣ Run Locally**  
```bash
ng serve
```
Visit `http://localhost:4200`.  

### **6️⃣ Deploy to Firebase Hosting**  
```bash
ng build
firebase deploy
```

---

## **📂 Project Structure**  
```
src/
├── app/
│ ├── components/ # Reusable UI components
│ │ ├── navbar/ # Navigation bar component
│ │ ├── buttons/ # Custom button components
│ │ └── loader/ # Loading spinner/indicator
│ │
│ ├── pages/ # Page components (one per route)
│ │ ├── login/ # Login page (Google Sign-In)
│ │ ├── role-review/ # Role assignment waiting page
│ │ ├── topic-overview/ # Main topics listing
│ │ └── ... # Other pages from feature list
│ │
│ ├── services/ # Data services & models
│ │ ├── topic.service.ts # Topic CRUD operations
│ │ ├── drawing.service.ts # Drawing management
│ │ ├── user.service.ts # User role management
│ │ └── ... # Other services from feature list
│ │
├────  # Custom auth implementation
│ │ ├── google-auth.service.ts # OAuth handling
│ │ └── app/services/auth.guard.ts # Route protection
│ │
│ ├── experiments/ # AI drawing features
│ │ ├── autosketch/ # AI-assisted drawing completion
│ │ └── sketch-generator/ # AI shape generation
│ │
│ ├── app.routes.ts # Routing configuration
│ ├── app.config.ts # App-wide settings
│ └── ...
│
├── environments/ # Firebase configs
└── ...

public/
└── assets/ # Static files

```
### Key Directories Explained:
- **`components/`** - Reusable presentational components (dumb components)
- **`pages/`** - Route-connected smart components (one per application page)
- **`services/`** - Firebase data operations and business logic
- **`experiments/`** - AI-powered drawing features (optional/developmental)
- **`google_signin/`** - Custom authentication flow (separate from Firebase Auth)


---
🎨 **Built with Angular & Firebase** | 🔌 **Custom Google Auth**
