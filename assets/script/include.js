/**
 * @param {string} id - 삽입될 요소의 ID (main-header, main-footer)
 * @param {string} fileName - 불러올 파일명 (header.html, footer.html)
 */

 let isManualScrolling = false; 

 function loadComponent(id, fileName) {
     const element = document.getElementById(id);
     if (!element) return;
 
     const isSubPage = window.location.pathname.includes('/works/');
     const filePath = isSubPage ? `../components/${fileName}` : `./components/${fileName}`;
 
     fetch(filePath)
         .then(res => res.text())
         .then(data => {
             element.innerHTML = data;
             if (isSubPage) {
                 const links = element.querySelectorAll('a');
                 links.forEach(link => {
                     const href = link.getAttribute('href');
                     if (href && !href.startsWith('http') && !href.startsWith('../') && !href.startsWith('#')) {
                         link.setAttribute('href', `../${href}`);
                     }
                 });
             }
             if (id === 'main-header') initHeader();
         })
         .catch(err => console.error('컴포넌트 로드 실패:', err));
 }
 
 function initHeader() {
     const navLinks = document.querySelectorAll('.nav-menu a');
     const isMainPage = !window.location.pathname.includes('/works/');
     const params = new URLSearchParams(window.location.search);
     const targetId = params.get('target');
 
     // --- [1. 상세페이지 메뉴 활성화] ---
     if (!isMainPage) {
         navLinks.forEach(link => {
             const href = link.getAttribute('href');
             if ((targetId && href.includes(`target=${targetId}`)) || (!targetId && href.includes('target=works'))) {
                 link.classList.add('active');
             } else {
                 link.classList.remove('active');
             }
         });
         return; 
     }
 
     // --- [2. 메인페이지용 섹션 데이터 수집] ---
     const sections = [];
     navLinks.forEach(link => {
         const href = link.getAttribute('href');
         if (href && href.includes('target=')) {
             const id = href.split('target=')[1];
             const section = document.getElementById(id);
             if (section) sections.push({ link, section, id });
         }
     });
 
     // 모든 메뉴 활성화를 관리하는 단 하나의 함수
     const updateActive = (id) => {
         if (isManualScrolling) return; // 클릭 중엔 절대 자동 변경 금지!
         navLinks.forEach(l => {
             const href = l.getAttribute('href');
             if (href && href.includes('target=')) {
                 const linkId = href.split('target=')[1];
                 l.classList.toggle('active', linkId === id);
             }
         });
     };
 
     // --- [3. 옵저버 (스크롤 감지)] ---
     const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 updateActive(entry.target.id);
             }
         });
     }, { rootMargin: '-45% 0px -45% 0px' });
 
     sections.forEach(s => observer.observe(s.section));
 
     // --- [4. 클릭 이벤트 (부드러운 이동)] ---
     navLinks.forEach(link => {
         link.addEventListener('click', (e) => {
             const href = link.getAttribute('href');
             if (!href || !href.includes('target=')) return;
             
             e.preventDefault();
             const id = href.split('target=')[1];
             const targetEl = document.getElementById(id);
 
             if (targetEl) {
                 isManualScrolling = true; // 스위치 ON (다른 로직 차단)
                 
                 navLinks.forEach(l => l.classList.remove('active'));
                 link.classList.add('active');
 
                 window.scrollTo({ top: targetEl.offsetTop - 80, behavior: 'smooth' });
 
                 // 스크롤이 완전히 멈췄을 때 스위치 OFF
                 const handleScrollEnd = () => {
                     isManualScrolling = false;
                     window.removeEventListener('scrollend', handleScrollEnd);
                 };
                 window.addEventListener('scrollend', handleScrollEnd);
                 
                 // 보험용 타이머 (scrollend 미지원 브라우저 대응)
                 setTimeout(() => { isManualScrolling = false; }, 1000);
             }
         });
     });
 
     // --- [5. 초기 로드 시 텔레포트 및 메뉴 활성화] ---
     if (targetId) {
         const targetEl = document.getElementById(targetId);
         if (targetEl) {
             isManualScrolling = true; 
             // 텔레포트 시에는 즉시 불 켜기
             navLinks.forEach(l => {
                 const href = l.getAttribute('href');
                 l.classList.toggle('active', href && href.includes(`target=${targetId}`));
             });
             
             window.scrollTo({ top: targetEl.offsetTop - 80, behavior: 'auto' });
             setTimeout(() => { isManualScrolling = false; }, 500);
         }
     }
 
     // --- [6. 브랜드 필름 영역 (50px) 체크] ---
     window.addEventListener('scroll', () => {
         if (isManualScrolling) return; // 클릭 중에는 이 체크 로직도 입 닫기!
         if (window.scrollY < 50) {
             navLinks.forEach(l => l.classList.remove('active'));
         }
     });
 }
 
 // 시작
 document.addEventListener('DOMContentLoaded', () => {
     loadComponent('main-header', 'header.html');
     loadComponent('main-footer', 'footer.html');
 });
