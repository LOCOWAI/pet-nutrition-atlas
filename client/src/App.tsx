import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopNav from "@/components/TopNav";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Library from "./pages/Library";
import PaperDetail from "./pages/PaperDetail";
import SpeciesPage from "./pages/SpeciesPage";
import { HealthTopicsList, HealthTopicDetail } from "./pages/HealthTopics";
import { BreedsList, BreedDetail } from "./pages/Breeds";
import MonthlyUpdates from "./pages/MonthlyUpdates";
import ContentOpportunities from "./pages/ContentOpportunities";
import Admin from "./pages/Admin";

function Router() {
  return (
    <>
      <TopNav />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/cats" component={() => <SpeciesPage species="cat" />} />
        <Route path="/dogs" component={() => <SpeciesPage species="dog" />} />
        <Route path="/health-topics" component={HealthTopicsList} />
        <Route path="/health-topics/:slug" component={HealthTopicDetail} />
        <Route path="/breeds" component={BreedsList} />
        <Route path="/breeds/:slug" component={BreedDetail} />
        <Route path="/monthly-updates" component={MonthlyUpdates} />
        <Route path="/content-opportunities" component={ContentOpportunities} />
        <Route path="/library" component={Library} />
        <Route path="/paper/:id" component={PaperDetail} />
        <Route path="/admin" component={Admin} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
