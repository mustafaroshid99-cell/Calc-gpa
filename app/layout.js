export const metadata = {
  title: "GPA Manager Pro",
  description: "Student GPA Management System"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
