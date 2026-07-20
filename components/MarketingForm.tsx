"use client";

import React, { useState, useRef } from "react";
import { submitMarketingRequest } from "../app/actions";

export default function MarketingForm() {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOtherAssistance, setShowOtherAssistance] = useState(false);
  const [showWebsiteUpdateAlert, setShowWebsiteUpdateAlert] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = [];
      for (let i = 0; i < e.target.files.length; i++) {
        filesArray.push(e.target.files[i]);
      }
      setSelectedFiles(filesArray);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleAssistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (value === "other") {
      setShowOtherAssistance(checked);
    }
    if (value === "Website update") {
      setShowWebsiteUpdateAlert(checked);
    }
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.current) return;

    // Check if at least one checkbox is checked
    const checkboxes = form.current.querySelectorAll('input[name="assistance_type[]"]:checked');
    const otherCheckbox = form.current.querySelector('input[value="other"]:checked');
    if (checkboxes.length === 0 && !otherCheckbox) {
      setErrorMsg("Please select at least one type of marketing assistance.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData(form.current);
      
      // 1 & 2. Upload files to Vercel Blob and save to Vercel Postgres (Server Action)
      const response = await submitMarketingRequest(formData);

      if (!response.success) {
        throw new Error(response.error);
      }
      
      // If the email specifically failed but the DB worked, we still count it as a success, 
      // but we can log a warning or tell the user.
      if (response.emailStatus === 'failed') {
        console.warn("Database saved successfully, but Email notification failed:", response.emailErrorMsg);
        // Optionally, we could set a warning message state here, but for now we'll just let them see the success screen
        // because their request IS safely in the database.
      } else if (response.emailStatus === 'missing_key') {
        console.warn("Resend API key is missing. Email skipped.");
      }

      setIsSuccess(true);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(`Error: ${error.message || "Failed to send request."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-primary)" }}>Request Submitted Successfully!</h3>
        <p style={{ color: "var(--color-text-muted)" }}>
          Thank you for your marketing request. A member of the Marcomms team will be in touch shortly.
        </p>
        <button 
          type="button"
          className="btn btn-primary" 
          style={{ marginTop: "32px", width: "auto" }}
          onClick={() => {
            setIsSuccess(false);
            if (form.current) form.current.reset();
            setShowOtherAssistance(false);
            setShowWebsiteUpdateAlert(false);
            setSelectedFiles([]);
          }}
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={sendEmail}>
      {/* Name */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name" className="form-label">First Name<span className="form-required">*</span></label>
          <input type="text" id="first_name" name="first_name" required className="form-control" placeholder="Jane" />
        </div>
        <div className="form-group">
          <label htmlFor="last_name" className="form-label">Last Name<span className="form-required">*</span></label>
          <input type="text" id="last_name" name="last_name" required className="form-control" placeholder="Doe" />
        </div>
      </div>

      {/* Department & Email */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="department" className="form-label">Your Department<span className="form-required">*</span></label>
          <input type="text" id="department" name="department" required className="form-control" placeholder="e.g. Childcare" />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Your Email<span className="form-required">*</span></label>
          <input type="email" id="email" name="email" required className="form-control" placeholder="jane.doe@ymcatrinity.org.uk" />
        </div>
      </div>

      {/* Assistance needed */}
      <div className="form-group">
        <label className="form-label">What marketing assistance do you need?<span className="form-required">*</span></label>
        <div className="check-radio-group">
          {[
            "Event coverage (marketing to attend your event or arrange press coverage)",
            "Marketing collateral (leaflet, brochure, poster etc.)",
            "Website update",
            "Social media post/campaign",
          ].map((opt, i) => (
            <label key={i} className="check-radio-item">
              <input type="checkbox" name="assistance_type[]" value={opt} onChange={handleAssistanceChange} />
              <span className="check-radio-label">{opt}</span>
            </label>
          ))}
          <label className="check-radio-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input type="checkbox" value="other" onChange={handleAssistanceChange} />
              <span className="check-radio-label">Other</span>
            </div>
            {showOtherAssistance && (
              <input 
                type="text" 
                name="assistance_type_other" 
                className="form-control" 
                placeholder="Please type another option here" 
                style={{ marginTop: "12px" }}
                required={showOtherAssistance}
              />
            )}
          </label>
        </div>

        {/* Website Update Alert */}
        {showWebsiteUpdateAlert && (
          <div style={{
            marginTop: "16px", 
            padding: "16px", 
            backgroundColor: "rgba(230, 26, 45, 0.05)", 
            borderLeft: "4px solid var(--color-primary)",
            borderRadius: "4px",
            animation: "fadeIn 0.3s ease"
          }}>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text)" }}>
              <strong>Notice:</strong> All website updates must be submitted through our dedicated <a href="https://ymca-change-requests.vercel.app/" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "underline" }}>Website Change Requests form</a>, even if you have other marketing requirements. Please submit your website request there, and use this form only for your remaining marketing needs.
            </p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="form-group">
        <label htmlFor="details" className="form-label">
          Please provide specific details of how the Marketing team can help you with this request.
          <span className="form-sub-label">Please think about who your target audience is, what you want to achieve, what impact do you want to create etc. If it is an update to a specific website page please provide the URL of the page.</span>
          <span className="form-required">*</span>
        </label>
        <textarea id="details" name="details" required className="form-control"></textarea>
      </div>

      {/* Deadline */}
      <div className="form-group">
        <label htmlFor="deadline" className="form-label">
          What is the deadline for your request?
          <span className="form-sub-label">Please note, you must allow 2 weeks notice for design work which includes posters, leaflets, booklets. This is to ensure that you can see a first draft and request any revisions.</span>
          <span className="form-required">*</span>
        </label>
        <input type="date" id="deadline" name="deadline" required className="form-control" style={{ width: "100%", maxWidth: "300px" }} />
      </div>

      {/* File Upload */}
      <div className="form-group">
        <label htmlFor="files" className="form-label">
          Please provide any pictures, logos or other files that will help us fulfill your request
        </label>
        <div className="file-upload-wrapper" style={{ position: "relative", overflow: "hidden" }}>
          <input 
            type="file" 
            id="files" 
            name="files" 
            multiple 
            onChange={handleFileChange} 
            onClick={(e) => { (e.target as any).value = null; }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
              zIndex: 10
            }}
            title="Click to browse files"
          />
          
          <div style={{ pointerEvents: "none", position: "relative", zIndex: 1 }}>
            <svg style={{ width: "32px", height: "32px", color: "var(--color-primary)", margin: "0 auto 12px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {selectedFiles.length > 0 ? (
              <div style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected:
                <ul style={{ listStyle: "none", padding: 0, marginTop: "8px", fontSize: "0.85rem", color: "var(--color-text)" }}>
                  {selectedFiles.map((f, i) => <li key={i}>{f.name}</li>)}
                </ul>
              </div>
            ) : (
              <>
                <span style={{ display: "block", color: "var(--color-text)", fontWeight: 500 }}>Browse Files</span>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Click to select files from your computer</span>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "4px", fontWeight: "bold" }}>(Max file size: 50MB)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Printing Quotes */}
      <div className="form-group">
        <label className="form-label">
          Do you require the marketing team to obtain printing quotes for you?
          <span className="form-required">*</span>
        </label>
        <div className="check-radio-group">
          {["Yes", "No", "NA"].map((opt) => (
            <label key={opt} className="check-radio-item">
              <input type="radio" name="quotes_required" value={opt} required />
              <span className="check-radio-label">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preferred Supplier */}
      <div className="form-group">
        <label htmlFor="preferred_supplier" className="form-label">
          If you require the marketing team to obtain quotes for printing do you have a preferred supplier?
          <span className="form-sub-label">(Please type the name of the preferred supplier, No or NA if not applicable)</span>
          <span className="form-required">*</span>
        </label>
        <textarea id="preferred_supplier" name="preferred_supplier" required className="form-control" style={{ minHeight: "80px" }}></textarea>
      </div>

      {errorMsg && <span className="error-message">{errorMsg}</span>}
      
      <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: "24px" }}>
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
