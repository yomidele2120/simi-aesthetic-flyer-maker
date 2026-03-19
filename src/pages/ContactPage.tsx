import Layout from "@/components/layout/Layout";
import { useState } from "react";

const ContactPage = () => {
  const [formType, setFormType] = useState<"contact" | "story" | "advertise">("contact");

  return (
    <Layout>
      <div className="container py-12 md:py-16 max-w-2xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          Reach our newsroom, submit a story tip, or inquire about advertising.
        </p>

        <div className="flex gap-2 mb-8 border-b border-border">
          {[
            { key: "contact" as const, label: "General" },
            { key: "story" as const, label: "Submit a Story" },
            { key: "advertise" as const, label: "Advertise" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFormType(tab.key)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                formType === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <input className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" />
          </div>

          {formType === "story" && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">Story Category</label>
                <select className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background">
                  <option>News Tip</option>
                  <option>Whistleblower Report</option>
                  <option>Investigation Lead</option>
                  <option>Other</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Your identity will be protected. Frontier follows strict source protection protocols.
              </p>
            </>
          )}

          {formType === "advertise" && (
            <div>
              <label className="text-sm font-medium block mb-1">Company / Organization</label>
              <input className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1">Message</label>
            <textarea rows={6} className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none" />
          </div>

          <button type="submit" className="ghost-button">
            {formType === "story" ? "Submit Tip" : formType === "advertise" ? "Send Inquiry" : "Send Message"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ContactPage;
