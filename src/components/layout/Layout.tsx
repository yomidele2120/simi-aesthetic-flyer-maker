import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BreakingNewsTicker from "../news/BreakingNewsTicker";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <BreakingNewsTicker />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
