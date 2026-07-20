"use client";

import React, { useState } from "react";
import { getMarketingRequests } from "../../app/actions";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await getMarketingRequests(password);
      if (response.success) {
        setIsAuthenticated(true);
        setRequests(response.requests || []);
      } else {
        setError(response.error || "Incorrect password");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch requests. Check database connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ marginTop: "100px", maxWidth: "450px" }}>
        <div className="card">
          <h2 style={{ textAlign: "center", marginBottom: "24px", color: "var(--color-primary)" }}>Admin Login</h2>
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "32px" }}>
            Please enter the admin password to view marketing requests.
          </p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <span className="error-message" style={{ marginBottom: "16px", textAlign: "center", display: "block" }}>{error}</span>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "1200px", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <h1 style={{ color: "var(--color-primary)" }}>Marketing Requests Admin</h1>
        <button className="btn" style={{ padding: "10px 20px", background: "white", border: "1px solid var(--color-border)", width: "auto", color: "var(--color-text)" }} onClick={() => setIsAuthenticated(false)}>Logout</button>
      </div>

      <div className="card" style={{ padding: "0", overflowX: "auto" }}>
        {requests.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>No requests found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)", backgroundColor: "#f8fafc" }}>
                <th style={{ padding: "16px", color: "var(--color-text-muted)", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "16px", color: "var(--color-text-muted)", fontWeight: 600 }}>Requester</th>
                <th style={{ padding: "16px", color: "var(--color-text-muted)", fontWeight: 600 }}>Requirements</th>
                <th style={{ padding: "16px", color: "var(--color-text-muted)", fontWeight: 600 }}>Deadline & Quotes</th>
                <th style={{ padding: "16px", color: "var(--color-text-muted)", fontWeight: 600 }}>Details & Files</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: any) => {
                // Safely parse assistance types and file URLs if they are JSON strings
                let assistanceTypes = req.assistance_types;
                if (typeof assistanceTypes === 'string') {
                  try { assistanceTypes = JSON.parse(assistanceTypes); } catch(e) {}
                }
                
                let fileUrls = req.file_urls;
                if (typeof fileUrls === 'string') {
                  try { fileUrls = JSON.parse(fileUrls); } catch(e) {}
                }

                // Handle date formatting whether it's a JS Date object or string
                let dateString = "N/A";
                if (req.created_at) {
                  dateString = new Date(req.created_at).toLocaleDateString();
                }

                return (
                  <tr key={req.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.02)"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "20px 16px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      {dateString}
                    </td>
                    <td style={{ padding: "20px 16px", verticalAlign: "top" }}>
                      <strong>{req.first_name} {req.last_name}</strong><br/>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{req.department}</span><br/>
                      <a href={`mailto:${req.email}`} style={{ color: "var(--color-primary)", textDecoration: "underline", fontSize: "0.85rem" }}>{req.email}</a>
                    </td>
                    <td style={{ padding: "20px 16px", verticalAlign: "top" }}>
                      <ul style={{ paddingLeft: "20px", margin: 0, color: "var(--color-text)" }}>
                        {Array.isArray(assistanceTypes) ? assistanceTypes.map((type: string, i: number) => <li key={i} style={{ marginBottom: "4px" }}>{type}</li>) : <li>{assistanceTypes}</li>}
                      </ul>
                    </td>
                    <td style={{ padding: "20px 16px", verticalAlign: "top" }}>
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Deadline:</span>
                        <strong>{req.deadline}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Quotes required:</span>
                        {req.quotes_required}
                      </div>
                      {req.quotes_required === 'Yes' && (
                         <div style={{ marginTop: "8px" }}>
                           <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Preferred Supplier:</span>
                           {req.preferred_supplier}
                         </div>
                      )}
                    </td>
                    <td style={{ padding: "20px 16px", verticalAlign: "top", maxWidth: "350px" }}>
                      <div style={{ maxHeight: "120px", overflowY: "auto", marginBottom: "16px", color: "var(--color-text)", paddingRight: "8px" }}>
                        {req.details}
                      </div>
                      
                      {Array.isArray(fileUrls) && fileUrls.length > 0 && (
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block", marginBottom: "4px" }}>Attached Files:</span>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {fileUrls.map((url: string, i: number) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" style={{ 
                                display: "inline-block",
                                padding: "4px 12px", 
                                backgroundColor: "rgba(230, 26, 45, 0.1)", 
                                color: "var(--color-primary)", 
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                                textDecoration: "none",
                                fontWeight: 500
                              }}>
                                File {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
