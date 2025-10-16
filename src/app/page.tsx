import AppThemeProvider from "@/components/AppThemeProvider";
import ToDoContainer from "@/components/ToDoContainer";

export default function Home() {
  return (
    <AppThemeProvider>
      <ToDoContainer />
    </AppThemeProvider>
  );
}