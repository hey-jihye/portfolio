/**
 * @param {string} id - 삽입될 요소의 ID (main-header, main-footer)
 * @param {string} fileName - 불러올 파일명 (header.html, footer.html)
 */

/**
 * 헤더와 푸터를 동적으로 로드하는 함수
 */
 function loadComponent(id, fileName) {
    const element = document.getElementById(id);
    if (!element) return;

    // 1. 현재 내가 상세페이지(works) 안에 있는지 확인
    const isSubPage = window.location.pathname.includes('/works/');
    
    // 2. 불러올 파일 경로 설정 (components 폴더 안에 넣으셨다면 경로 확인!)
    // 만약 components 폴더 안 쓰시면 아래에서 'components/' 글자만 지우세요.
    const filePath = isSubPage ? `../components/${fileName}` : `./components/${fileName}`;

    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            // 3. 화면에 헤더/푸터 글자를 먼저 집어넣음
            element.innerHTML = data;

            // 4. [핵심] 상세페이지라면, 방금 집어넣은 헤더 안의 링크들에 ../ 를 붙여줌
            if (isSubPage) {
                const links = element.querySelectorAll('a');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    // 외부링크가 아니고, 이미 ../ 가 붙어있지 않다면 앞에 붙여줌
                    if (href && !href.startsWith('http') && !href.startsWith('../')) {
                        link.setAttribute('href', `../${href}`);
                    }
                });
            }

            // 5. 헤더일 경우에만 인터랙션 함수 실행
            if (id === 'main-header') {
                initHeader();
            }
        })
        .catch(err => console.error('로드 실패:', err));
}

/**
 * 헤더 인터랙션 초기화 (기존 경로수정 로직은 여기서 지웠습니다!)
 */
function initHeader() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = [];
    const isMainPage = !window.location.pathname.includes('/works/');

    // 상세페이지 처리
    if (!isMainPage) {
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes('target=works')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        return;
    }

    // 섹션 데이터 수집 (메인페이지용)
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || !href.includes('target=')) return;
        const id = href.split('target=')[1];
        const section = document.getElementById(id);
        if (section) sections.push({ link, section, id });
    });

    let isBlockObserver = true; 

    const observerOptions = {
        root: null,
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        if (isBlockObserver) return;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navLinks.forEach(l => {
                    const href = l.getAttribute('href');
                    if (href && href.includes('target=')) {
                        const linkId = href.split('target=')[1];
                        l.classList.toggle('active', linkId === targetId);
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(s => observer.observe(s.section));

    // 클릭 시 부드러운 이동
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.includes('target=')) return;

            e.preventDefault();
            const id = href.split('target=')[1];
            const targetEl = document.getElementById(id);

            if (targetEl) {
                isBlockObserver = true;
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                window.scrollTo({
                    top: targetEl.offsetTop - 80,
                    behavior: 'smooth'
                });

                setTimeout(() => { isBlockObserver = false; }, 800);
            }
        });
    });

    // 초기 로드 시 스크롤 위치 맞추기
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('target');

    if (targetId) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            const match = sections.find(s => s.id === targetId);
            if (match) match.link.classList.add('active');

            window.scrollTo({ top: targetEl.offsetTop - 80, behavior: 'auto' });
            setTimeout(() => { isBlockObserver = false; }, 500);
        }
    } else {
        setTimeout(() => { isBlockObserver = false; }, 100);
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY < 50) {
            navLinks.forEach(l => l.classList.remove('active'));
        }
    });
}

// 실행
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('main-header', 'header.html');
    loadComponent('main-footer', 'footer.html');
});