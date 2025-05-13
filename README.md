# **Hand Drawing Application** 🎨✏️  

### This project is a collaboration between Thomas More in Geel, Belgium and KMITL in Bangkok, Thailand.
![Thomas More and KMITL](tm_kmitl.jpg)

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
| **Topic Detail** | Create/update/delete **topics** and their **labels**. |
| **Writer Management** | Approve new Writers and manage their roles. |

### **🛠️ Admin**  
| Page | Description |
|------|-------------|
| **Manager Management** | Manage all users (assign roles: **Writer, Manager, Admin**). |

---

## **🛠️ Technologies Used**  
- **Frontend**: Angular, TypeScript, Tailwind  
- **Database**: Firebase Firestore  
- **Hosting**: Firebase Hosting  
- **Authentication**: Custom Google Sign-In with Angular Guards (separate from Firebase Auth)  

---

## **🛢 Database Design**  
![afbeelding](https://github.com/user-attachments/assets/147dadd0-fe6a-4d1c-a896-f0658fe386ac)



---

## **🚀 Setup & Deployment Guide**  

### **Prerequisites**  
- Node.js (v16+)  
- Firebase account (for Firestore & Hosting)
- Google account

### **1️⃣ Clone the Repository**  
```bash
git clone https://github.com/MarnickM/Thai_Internship_2025.git
cd Thai_Internship_2025
```

### **2️⃣ Install Dependencies**  
```bash
npm install
```

### **3️⃣ Configure Google Sign-In**  
1. Create a Google OAuth project in the Google Console
   - create a new project
   - go to your new project
   - open the navigation menu on the top left and go to **API & Services** > **OAuth Consent Screen**
   - select **External** and then click **create**
   - **OAuth Consent Screen**:
     - in the **App information** category, choose a name for your app and add your gmail as the user support email
     - in the **Developer Contact Information** category, add your gmail again
     - click on **save & continue**
   - **Scopes**:
     - don't add any, just click **save & continue** at the bottom
   - **Test Users**:
     - add your gmail again
   - **Summary**:
     - you can check if everything is correct
   - in the navigation menu on the left, select **Credentials**
     - click on **create credentials** and select **OAuth client ID**
     - select the application type: **Web application**
     - type in the name of your application, take the name you gave your application earlier
     - in the **Authorized JavaScript Origins** category, add all URL's that will have access to your application (see image below). This will enable the use of the application both locally (localhost) as on the web (url of hosting).
     => you may not have the URL of the hosting yet, our hosting project will be created in part 4. As soon as your project is created and deployed, you can add the URL here.
     - click on **create** at the bottom of the page
     - a screen will now appear with your credentials, copy both your client secret and client ID
     - Go to the Angular application and update Google OAuth credentials in (see image below):
       - `src/environments/environment.ts`

URL's in Authorized JavaScript Origins:

![afbeelding](https://github.com/user-attachments/assets/7e5e42a7-c25c-4e56-a893-a5fc3d6f5522)

Environments file where you need to place your credentials:

![afbeelding](https://github.com/user-attachments/assets/43b8b21d-bf72-4cf1-9b22-17a07c44bf2f)

------

### **4️⃣ Configure Firebase (Database & Hosting)**  
#### **Database**
1. Set up **Firestore Database** in Firebase Console
2. Add config (replace current config from Firebase) provided by Firebase in src/app/app.config.ts

#### **Hosting**
1. Create a new project online in the Firebase console
2. Install Firebase CLI in angular project via `npm install -g firebase-tools`
3. Run `firebase login` to login into the account you used to make the Firebase project in the console in step 1
4. Run `firebase init` to initialize setting up your deployment
   - **select** Hosting: Configure files for Firebase Hosting and (optionally) set up Github Action deploys
   - **select** use an existing project
   - **select** the project you made in step 1
   - **change** the public directory from (public) to dist/drawing-app
   - configure as a single-page app: **No**
   - set up automatic builds and deploys with Github: **No**
6. Run `Firebase deploy`, the app will be deployed. Use the link provided in your terminal after you used this command to visit your app. Don't forget to put this link in the JavaScript Origins in OAuth in your Google console project to enable login via a Google account.

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

---

## Contributors 👥

    Sen Dewael

    Marnick Michielsen
