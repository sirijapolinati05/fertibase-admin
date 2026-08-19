from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import products, jobs, testimonials, applications, latest_updates, resources, contact, auth
from fastapi.staticfiles import StaticFiles
from database import engine, Base, get_db
import models
from fastapi import Depends
from sqlalchemy.orm import Session

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fertibase Admin API")

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        # Check if any admin exists
        admin = db.query(models.AdminUser).filter_by(emp_id="NAVEENSIR").first()
        if not admin:
            default_admin = models.AdminUser(
                emp_id="NAVEENSIR",
                password="9493462778",
                name="Naveen",
                role="admin",
                image_url="https://i.pravatar.cc/300?img=68"
            )
            db.add(default_admin)
            db.commit()
            print("Successfully seeded default Admin user.")
    except Exception as e:
        print("Failed to seed default admin:", e)
    finally:
        db.close()


# Mount uploads directory for serving static files
os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://admin.fertibase.in",
        "https://fertibase.in",
        "https://admin-backend.fertibase.in",
        "https://fertibase-admin.onrender.com",
        "https://fertibase-admin-nine.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(testimonials.router, prefix="/api/testimonials", tags=["Testimonials"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(latest_updates.router, prefix="/api/latest-updates", tags=["Latest Updates"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/api/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        p_count = db.query(models.Product).count()
        j_count = db.query(models.Job).count()
        t_count = db.query(models.Testimonial).count()
        u_count = db.query(models.LatestUpdate).count()
        r_count = db.query(models.Resource).count()
        
        return {
            "totalProducts": p_count,
            "totalJobs": j_count,
            "totalTestimonials": t_count,
            "totalUpdates": u_count,
            "totalResources": r_count
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def read_root():
    return {"message": "Fertibase Admin API is running"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=5000, reload=True)


