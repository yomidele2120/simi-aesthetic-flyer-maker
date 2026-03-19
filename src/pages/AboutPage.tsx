import Layout from "@/components/layout/Layout";

const AboutPage = () => (
  <Layout>
    <div className="container py-12 md:py-16 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">About Frontier</h1>

      <div className="prose-article space-y-8">
        <section>
          <h2 className="font-serif text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-foreground/80 leading-relaxed">
            Frontier is an independent news and media organization dedicated to providing accurate, balanced, and timely information. Our mission is to bring the most important stories to the public with clarity, integrity, and responsibility — from Nigeria to the world.
          </p>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl font-semibold mb-3">Our Vision</h2>
          <p className="text-foreground/80 leading-relaxed">
            To be Africa's most trusted and innovative news platform, setting the standard for responsible journalism in the digital age. We envision a world where every citizen has access to facts that empower informed decisions.
          </p>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl font-semibold mb-3">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              { title: "Truth", desc: "We report facts without bias or favor." },
              { title: "Integrity", desc: "We hold ourselves to the highest ethical standards." },
              { title: "Independence", desc: "We are not beholden to any political or commercial interest." },
              { title: "Innovation", desc: "We leverage technology to enhance—never replace—journalism." },
            ].map((v) => (
              <div key={v.title} className="border border-border p-4">
                <h3 className="font-serif text-lg font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl font-semibold mb-3">Leadership</h2>
          <div className="space-y-4">
            {[
              { name: "Adunni Okafor", role: "Editor-in-Chief" },
              { name: "Chukwuemeka Nwosu", role: "Managing Editor" },
              { name: "Funke Adeyemi", role: "Head of Digital" },
              { name: "Ibrahim Yakubu", role: "Investigations Director" },
            ].map((l) => (
              <div key={l.name} className="flex items-center gap-4 border-b border-border pb-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                  {l.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-sm text-muted-foreground">{l.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  </Layout>
);

export default AboutPage;
