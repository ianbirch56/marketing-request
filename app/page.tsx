import Image from "next/image";
import MarketingForm from "../components/MarketingForm";

export default function Home() {
  return (
    <>
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">YMCA Trinity Group Marketing Requests</h1>
        </div>
      </header>
      
      <main>
        <div className="container">
          <div className="card">
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Image
                src="/logo.png"
                alt="YMCA Trinity Group Logo"
                width={400}
                height={55}
                style={{
                  margin: "0 auto",
                  objectFit: "contain",
                  maxWidth: "100%",
                  height: "auto",
                }}
                priority
              />
            </div>
            
            <h2 style={{ marginBottom: "16px", color: "var(--color-primary)", fontWeight: 700, fontSize: "1.5rem" }}>
              Submit a Marketing Request
            </h2>
            <p style={{ marginBottom: "32px", color: "var(--color-text-muted)" }}>
              Please complete this form to request marketing assistance. Ensure all required fields are filled out.
            </p>
            
            <MarketingForm />
          </div>
        </div>
      </main>
    </>
  );
}
