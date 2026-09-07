// 闪烁问题的早期主题注入，避免暗色模式初始白闪
export function ThemeScript() {
  const code = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
