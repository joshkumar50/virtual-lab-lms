## 👥 Team Name: Nexbit
##    Members :
##            1.Josh Kumar
##            2.Dhoni
##            3.Mohan Sai
##            4.Sai
##Deployment link :https://virtual-lab-lms.vercel.app/
-------------------------------
## 🚀 New Features (v2.0)
- Improved Auto Grading System (Rule-Based Validation + Rubric-Based Assessment)
- Introduced in-app remainder and notification
- Added video section in courses (Video + Meet link Now Available)
- All The Working Functionality Comes Alive(all fetching solved)

-------------------------------
## ⚙️ Technical Stack & Dependencies
We’ve built the platform using the **MERN stack**:
- **MongoDB** – for data storage  
- **Express.js** – backend framework  
- **React.js** – frontend framework  
- **Node.js** – server environment  

### 🧩 Frontend Libraries & Tools
- **React Router DOM** – client-side routing  
- **Framer Motion** – smooth animations  
- **Tailwind CSS** – responsive styling  
- **Axios** – API requests  
- **Lucide React** – modern icons  
- **React Hot Toast** – user notifications  

### 🧠 Backend Libraries
- **Mongoose** – MongoDB modeling  
- **jsonwebtoken (JWT)** – authentication  
- **bcrypt** – password encryption  
- **helmet** and **cors** – security middleware  
- **dotenv** – environment configuration  
- **express-rate-limit** – API protection  

### ☁️ Deployment
- **Frontend:** Vercel  
- **Backend:** Render  
- **Database:** MongoDB Atlas (cloud)  

------------------------------------------------------

## 🚀 Features Implemented — Virtual Lab LMS (Team Nexbit)

---------------------------------------------------------------

### 🥉 Bronze Level — Basic Functionality

#### 🧾 1. User Registration & Login
- 🔐 Users can register with **name, email, password, and role** (Student or Teacher).  
- 🔒 Secure authentication using **JWT tokens** and **bcrypt password encryption**.  
- 👤 Login system redirects users based on their role (Student or Teacher dashboard).  
- 🧠 Session persistence with local storage and token validation.  

#### 📚 2. Course Management (Teacher Role)
- 👩‍🏫 Teachers can **create, edit, and publish courses** with title, description, and duration.  
- 🧾 Courses are stored in **MongoDB** and fetched dynamically to the homepage.  
- 👨‍🎓 Students can **view all available courses** and read course details before enrolling.  

-------------------------

### 🥈 Silver Level — Intermediate Functionality

#### 🎓 3. Course Enrollment
- ✅ Students can **enroll** in available courses with one click.  
- 📋 The system maintains **enrolled course lists** for each student.  
- 👩‍🏫 Teachers can view **all students enrolled** in their courses via the teacher dashboard.  
- 🔄 Enrollment data is stored securely in MongoDB with **real-time updates**.  

-------------------------

### 🥇 Gold Level — Advanced Functionality

#### 🧪 4. Assignment & Experiment Submission
- 📘 Teachers can **assign virtual experiments or lab assignments** to a course.  
- 🔬 Students can **perform interactive experiments** directly within the LMS, including:  
  - ⚡ Ohm’s Law Lab (Electrical circuits)  
  - 🔌 Circuit Analysis Lab  
  - 💡 Logic Gate Simulator  
  - 🌊 Double Slit Experiment (Physics)  
  - 🧪 Chemistry Lab (pH and molarity simulation)  
- 📤 Students can **submit lab results** for instant evaluation.  
- ⏱️ Submissions are **graded in under 1 second** using a **rule-based auto-grading algorithm (no AI)**.  
- 📊 Students instantly receive **detailed breakdown feedback** (scores + analysis).  

-----------------------

### 💎 Platinum Level — Expert Functionality

#### 🧠 5. Intelligent Auto-Grading System (NO AI)
- ⚡ Grading speed: **<1 second per submission**.  
- 🎯 100% accuracy through **scientific formula validation** (e.g., V = I × R, pH calculations).  
- 💰 **Zero operational cost** — no AI, no API calls, no tokens required.  
- 🧾 Generates **structured feedback reports** with point-by-point evaluation.  
- 🔍 Checks for experiment accuracy, tolerance limits, and correct section presence (observations, results, analysis).  
- 🧩 Uses hybrid scoring:  
  - Rule-Based Validation (50 pts)  
  - Rubric-Based Assessment (50 pts)  

#### ✏️ 6. Teacher Override & Hybrid Grading
- 👩‍🏫 Teachers can **override auto-grades manually** for quality assurance.  
- 📄 System keeps **history of original vs. overridden grades** for transparency.  
- 🧠 Combines **automation with human judgment** — the best of both worlds.  

---------------------

### ⭐ Bonus & Optional Advanced Features (Beyond Platinum)

#### 🧭 7. Role-Based Dashboards
- 🧑‍🎓 **Student Dashboard:**  
  - View enrolled courses and labs  
  - Submit experiments  
  - View instant feedback & scores  
  - Track overall progress  

- 👩‍🏫 **Teacher Dashboard:**  
  - Create & manage courses  
  - Assign labs  
  - Review submissions & override grades  
  - Monitor student analytics & engagement hours  

#### 🔬 8. Interactive Virtual Laboratory System
- Built with **pure JavaScript + HTML5 Canvas** (no Unity or external physics engine).  
- Real-time experiment visualization: **circuits, equations, waves, and reactions**.  
- Supports **drag-and-drop components**, parameter sliders, and live calculations.  
- Accessible from any device — **lightweight and fast loading**.  

#### 📊 9. Analytics & Progress Tracking
- Real-time **student progress reports** per course/lab.  
- Graphical analytics (using **Recharts / Chart.js**).  
- Displays **submission count, grade trends, and completion rates**.  

#### 🔐 10. Security & Reliability
- **JWT-based authentication** and authorization.  
- **Role-based access control** (Teacher / Student).  
- **Password encryption** using bcryptjs.  
- **Rate limiting**, Helmet, and CORS for secure API access.  
- Protected backend routes with **role verification middleware**.  

#### ☁️ 11. Deployment & Scalability
- **Frontend** hosted on **Vercel** for instant deployment.  
- **Backend** deployed on **Render / Railway** with **MongoDB Atlas** cloud database.  
- Works seamlessly across devices (mobile, tablet, desktop).  
- **Zero external dependencies** — scalable to thousands of users at no extra cost.

### Deployment link:https://virtual-lab-lms.vercel.app/
