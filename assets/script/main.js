



// Experience Modal 영역

const expButtons = document.querySelectorAll('.exp-item');
const modal = document.getElementById('exp-modal');
const modalContentViewer = modal.querySelector('.modal-image-viewer');
const modalClose = document.getElementById('modal-close');

// 각 경력 데이터 (이미지 경로들)
const expData = {
    'exp01': [
        './images/main/exp01_page1.png',
        './images/main/exp01_page1.png',
        './images/main/exp01_page1.png',
    ],
    'exp02': [
        './images/main/exp01_page1.png',
        './images/main/exp01_page1.png',
    ],
    'exp03': [
        './images/main/exp01_page1.png',
        './images/main/exp01_page1.png',
    ],
    'exp04': [
        './images/main/exp01_page1.png',
    ],
};

// 1. 클릭 시 모달 열기
expButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const expId = btn.getAttribute('data-exp'); // 클릭한 경력의 ID 가져오기
        const images = expData[expId]; // 해당 ID의 이미지 데이터 가져오기

        // 모달 뷰어 비우기
        modalContentViewer.innerHTML = '';

        // 이미지 HTML 생성해서 넣기
        images.forEach(imgSrc => {
            const imgTag = `<img src="${imgSrc}" alt="">`;
            modalContentViewer.insertAdjacentHTML('beforeend', imgTag);
        });

        // 모달 활성화
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 모달 열렸을 때 배경 스크롤 방지
    });
});

// 2. 닫기 버튼 클릭 시 모달 닫기
modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // 배경 스크롤 복구
});

// 3. 배경 클릭 시 모달 닫기
modal.addEventListener('click', (e) => {
    if (e.target === modal) { // 클릭한 곳이 모달 배경(overlay) 자체일 때만 닫기
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 배경 스크롤 복구
    }
});