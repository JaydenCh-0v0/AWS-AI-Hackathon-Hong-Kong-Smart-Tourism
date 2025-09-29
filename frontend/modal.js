// 創建 info modal
function createInfoModal() {
  const modal = document.createElement('div');
  modal.id = 'infoModal';
  modal.className = 'info-modal hidden';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeInfoModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modalTitle"></h3>
        <button class="modal-close" onclick="closeInfoModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-image">
          <img id="modalImage" src="" alt="">
          <div class="image-credit">Photographer: <span id="modalPhotographer"></span></div>
        </div>
        <div class="modal-info">
          <div class="info-section">
            <h4>📍 Discription</h4>
            <p id="modalDescription"></p>
          </div>
          <div class="info-section">
            <h4>🚇 Traffic Information</h4>
            <p id="modalTransit"></p>
          </div>
          <div class="info-section">
            <h4>💬 User comment</h4>
            <div id="modalReviews"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// 顯示 info modal
function showInfoModal(id, title, description, reviews, photographer, transit) {
  if (!document.getElementById('infoModal')) {
    createInfoModal();
  }
  
  const modal = document.getElementById('infoModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDescription').textContent = description;
  document.getElementById('modalPhotographer').textContent = photographer;
  document.getElementById('modalTransit').textContent = transit || 'Within walking distance';
  
  // 設置圖片
  const cardElement = document.querySelector(`[data-card-info*='"id":"${id}"']`);
  if (cardElement) {
    const cardInfo = JSON.parse(cardElement.dataset.cardInfo);
    const modalImage = document.getElementById('modalImage');
    modalImage.src = cardInfo.images[0] || '';
    modalImage.alt = title;
  }
  
  // 顯示評價
  const reviewsContainer = document.getElementById('modalReviews');
  reviewsContainer.innerHTML = '';
  
  if (reviews && reviews.length > 0) {
    reviews.forEach(review => {
      const reviewDiv = document.createElement('div');
      reviewDiv.className = 'review-item';
      reviewDiv.innerHTML = `
        <div class="review-author">${review.author}</div>
        <div class="review-text">${review.text}</div>
      `;
      reviewsContainer.appendChild(reviewDiv);
    });
  } else {
    reviewsContainer.innerHTML = '<p class="no-reviews">No Comment</p>';
  }
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// 關閉 info modal
function closeInfoModal() {
  const modal = document.getElementById('infoModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// 初始化時創建 modal
document.addEventListener('DOMContentLoaded', () => {
  createInfoModal();
});