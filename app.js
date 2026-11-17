/**
 * 모임 강연·서적 디지털 아카이브 웹 대시보드 스크립트
 * (보안 e-Book 뷰어 & Web Speech TTS 오디오북 지원)
 */

// ======================== 1. 기본 데이터 정의 (샘플) ========================
const DEFAULT_IN_PROGRESS_BOOKS = [
  { id: 1, title: "인비인", author: "성해나 지음", rate: 100, contributors: 6, bg: "linear-gradient(135deg, #be123c, #881337)" },
  { id: 2, title: "가호", author: "무라카미 하루키 지음", rate: 70, contributors: 4, bg: "linear-gradient(135deg, #0284c7, #075985)" },
  { id: 3, title: "어떻게 생각할 것인가", author: "제임스 앨런 지음", rate: 70, contributors: 5, bg: "linear-gradient(135deg, #1e293b, #0f172a)" },
  { id: 4, title: "투자 말고 트레이딩", author: "오션 드라이브 지음", rate: 70, contributors: 3, bg: "linear-gradient(135deg, #b91c1c, #7f1d1d)" },
  { id: 5, title: "빵종 사육 준수 사항", author: "김혜영 지음", rate: 70, contributors: 4, bg: "linear-gradient(135deg, #15803d, #14532d)" },
  { id: 6, title: "내일은 멍때리기", author: "옵쓰양 지음", rate: 100, contributors: 8, bg: "linear-gradient(135deg, #d97706, #92400e)" },
  { id: 7, title: "공공조달관리사 실기 최종정리", author: "문형남 지음", rate: 70, contributors: 3, bg: "linear-gradient(135deg, #ea580c, #9a3412)" },
  { id: 8, title: "최재붕의 AI 트렌드 2027", author: "최재붕 지음", rate: 70, contributors: 7, bg: "linear-gradient(135deg, #4f46e5, #3730a3)" },
  { id: 9, title: "추세추종 매수매도 바이블", author: "올투 지음", rate: 70, contributors: 4, bg: "linear-gradient(135deg, #059669, #065f46)" },
  { id: 10, title: "서리꽃 1", author: "조정래 지음", rate: 70, contributors: 5, bg: "linear-gradient(135deg, #334155, #1e293b)" },
];

const DEFAULT_NEW_SCANS = [
  { id: 101, title: "레몬나무의 바다", author: "마리아 돌로레스 아길라", category: "2026 뉴베리 아너상 수상작", bg: "#d97706" },
  { id: 102, title: "가슴속엔 조그만 사랑이 반짝이누나", author: "나태주 엮음", category: "풀꽃 시인 나태주 명시 선집", bg: "#0891b2" },
  { id: 103, title: "자도 자도 피곤한 당신을 위한 수면 처방", author: "이준웅", category: "현대인 수면 과학 가이드", bg: "#2563eb" },
  { id: 104, title: "어디서 살 것인가, 어떻게 살 것인가", author: "이현철", category: "부동산 및 삶의 공간 담론", bg: "#475569" },
];

const DEFAULT_VOLUNTEERS = [
  { rank: 1, name: "은혜사랑", pages: 840, avatar: "🥇" },
  { rank: 2, name: "김현숙", pages: 710, avatar: "🥈" },
  { rank: 3, name: "말씀의빛", pages: 590, avatar: "🥉" },
  { rank: 4, name: "열정봉사", pages: 460, avatar: "⭐" },
  { rank: 5, name: "늘푸른나무", pages: 380, avatar: "🌿" },
  { rank: 6, name: "소망지기", pages: 320, avatar: "🕊️" },
  { rank: 7, name: "샘물", pages: 290, avatar: "💧" },
  { rank: 8, name: "나그네", pages: 210, avatar: "👣" },
];

// 현재 활성 상태
let state = {
  inProgress: [...DEFAULT_IN_PROGRESS_BOOKS],
  newScans: [...DEFAULT_NEW_SCANS],
  volunteers: [...DEFAULT_VOLUNTEERS],
  currentFilter: "all",
  verifiedUser: localStorage.getItem("ocr_verified_volunteer") || null
};

// ======================== 2. 렌더링 함수들 ========================

// (1) 통계 숫자 업데이트
function updateStatsOverview() {
  const total = state.inProgress.length;
  const completed = state.inProgress.filter(b => b.rate === 100).length;
  const totalVolunteers = state.volunteers.length;
  const totalPages = state.volunteers.reduce((sum, v) => sum + v.pages, 0);

  document.getElementById("statTotalBooks").innerText = `${total}권`;
  document.getElementById("statCompletedBooks").innerText = `${completed}권`;
  document.getElementById("statTotalPages").innerText = `${totalPages.toLocaleString()} 건`;
  document.getElementById("statTotalVolunteers").innerText = `${totalVolunteers}명`;

  // 탭 카운트
  document.getElementById("countAll").innerText = total;
  document.getElementById("countCompleted").innerText = completed;
  document.getElementById("countProgress").innerText = total - completed;
}

// (2) 진행 중인 책들 렌더링
function renderBooksGrid() {
  const container = document.getElementById("booksGrid");
  container.innerHTML = "";

  const filtered = state.inProgress.filter(b => {
    if (state.currentFilter === "completed") return b.rate === 100;
    if (state.currentFilter === "progress") return b.rate < 100;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; color: #94a3b8;">해당 조건의 도서가 없습니다.</div>`;
    return;
  }

  filtered.forEach(book => {
    const isDone = book.rate === 100;
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <div class="book-card-cover" style="background: ${book.bg}">
        <span class="card-num-badge">${book.id}</span>
        <div class="card-cover-title">${book.title}</div>
        <div class="card-cover-author">${book.author}</div>
      </div>
      <div class="book-card-info">
        <div class="card-info-title" title="${book.title}">${book.title}</div>
        <div class="card-info-author">${book.author}</div>
        <div class="progress-wrap">
          <div class="progress-header">
            <span class="${isDone ? 'rate-100' : 'rate-progress'}">
              <i class="fa-solid ${isDone ? 'fa-check-circle' : 'fa-clock'}"></i> 복원률 ${book.rate}%
            </span>
            <span style="color:#64748b; font-size:0.75rem;">
              ${isDone ? '<strong style="color:#059669;">보존 완료</strong>' : `${book.contributors}명 참여`}
            </span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${isDone ? 'fill-100' : 'fill-progress'}" style="width: ${book.rate}%;"></div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// (3) 새로 스캔된 책 렌더링
function renderNewScans() {
  const container = document.getElementById("newScansGrid");
  container.innerHTML = "";

  state.newScans.forEach(scan => {
    const card = document.createElement("div");
    card.className = "new-scan-card";
    card.innerHTML = `
      <div class="new-scan-cover-thumb" style="background: ${scan.bg}">
        <span>${scan.title.slice(0, 4)}</span>
      </div>
      <div class="new-scan-details">
        <div class="new-scan-title" title="${scan.title}">${scan.title}</div>
        <div class="new-scan-meta">${scan.author} · ${scan.category}</div>
        <span class="new-scan-status-tag">
          <i class="fa-solid fa-hourglass-half"></i> 스캔 완료 · 단어 검수 대기 중
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

// (4) 명예의 전당 & 랭킹 렌더링 (수정: *권 기여 삭제, 순수 검수 건수만 표기)
function renderHallOfFame(searchTerm = "") {
  const podiumArea = document.getElementById("podiumArea");
  const rankingList = document.getElementById("rankingList");

  const filtered = state.volunteers.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // 상위 3명 포디움
  if (!searchTerm && state.volunteers.length >= 3) {
    const top1 = state.volunteers[0];
    const top2 = state.volunteers[1];
    const top3 = state.volunteers[2];

    podiumArea.innerHTML = `
      <!-- 2등 -->
      <div class="podium-slot slot-2">
        <div class="podium-avatar">${top2.avatar}</div>
        <div class="podium-name">${top2.name}</div>
        <div class="podium-pages">${top2.pages}건 검수</div>
        <div class="podium-pillar">2</div>
      </div>
      <!-- 1등 -->
      <div class="podium-slot slot-1">
        <div class="podium-avatar">${top1.avatar}</div>
        <div class="podium-name">${top1.name}</div>
        <div class="podium-pages">${top1.pages}건 검수</div>
        <div class="podium-pillar">1</div>
      </div>
      <!-- 3등 -->
      <div class="podium-slot slot-3">
        <div class="podium-avatar">${top3.avatar}</div>
        <div class="podium-name">${top3.name}</div>
        <div class="podium-pages">${top3.pages}건 검수</div>
        <div class="podium-pillar">3</div>
      </div>
    `;
  }

  // 전체 리스트
  rankingList.innerHTML = "";
  if (filtered.length === 0) {
    rankingList.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.88rem;">일치하는 봉사자 닉네임이 없습니다.</div>`;
    return;
  }

  filtered.forEach(vol => {
    const item = document.createElement("div");
    item.className = "ranking-item";
    item.innerHTML = `
      <div class="rank-left">
        <span class="rank-num">${vol.rank}</span>
        <span class="rank-name">${vol.avatar} ${vol.name}</span>
      </div>
      <div class="rank-score">${vol.pages.toLocaleString()}건 검수 완료</div>
    `;
    rankingList.appendChild(item);
  });
}

// ======================== 3. 봉사자 닉네임 인증 ========================
function initVolunteerAuth() {
  const accessLockedView = document.getElementById("accessLockedView");
  const accessUnlockedView = document.getElementById("accessUnlockedView");
  const authStatusChip = document.getElementById("authStatusChip");
  const verifiedUserName = document.getElementById("verifiedUserName");
  const input = document.getElementById("volunteerNameInput");
  const btnVerify = document.getElementById("btnVerifyVolunteer");

  function unlock(userName) {
    if (accessLockedView) accessLockedView.classList.add("hidden");
    if (accessUnlockedView) accessUnlockedView.classList.remove("hidden");
    if (authStatusChip) {
      authStatusChip.innerHTML = `<i class="fa-solid fa-check"></i> ${userName}님 열람 권한 승인됨`;
      authStatusChip.className = "auth-status-chip unlocked";
    }
    if (verifiedUserName) {
      verifiedUserName.innerText = userName;
    }
  }

  if (state.verifiedUser) {
    unlock(state.verifiedUser);
  }

  btnVerify.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) {
      alert("봉사자 닉네임 또는 성함을 입력해 주세요.");
      return;
    }

    const match = state.volunteers.find(v => v.name.toLowerCase() === name.toLowerCase());

    if (match) {
      alert(`[열람 승인] ${match.name} 봉사자님 확인되었습니다!\n지금까지 ${match.pages}건의 귀한 검수를 보태어 주셨습니다. 복원본 e-Book 및 오디오북이 열렸습니다.`);
    } else {
      alert(`[열람 승인] ${name} 봉사자님 환영합니다!\n동참해 주셔서 감사드리며, 복원본 e-Book 및 오디오북을 열어드립니다.`);
      state.volunteers.push({
        rank: state.volunteers.length + 1,
        name: name,
        pages: 15,
        avatar: "🌱"
      });
      renderHallOfFame();
      updateStatsOverview();
    }

    state.verifiedUser = name;
    localStorage.setItem("ocr_verified_volunteer", name);
    unlock(name);
  });
}

// ======================== 4. 전용 e-Book 보안 뷰어 & TTS 오디오북 ========================
let ttsUtterance = null;
let isTtsPlaying = false;

function initEbookViewerAndAudio() {
  const modal = document.getElementById("ebookModal");
  const btnOpenEbook = document.getElementById("btnOpenEbook");
  const btnOpenAudio = document.getElementById("btnOpenAudiobook");
  const btnCloseEbook = document.getElementById("btnCloseEbook");
  const windowEl = modal ? modal.querySelector(".ebook-modal-window") : null;
  const pageContainer = document.getElementById("ebookPageContainer");

  // 테마 버튼
  const btnLight = document.getElementById("btnThemeLight");
  const btnSepia = document.getElementById("btnThemeSepia");
  const btnDark = document.getElementById("btnThemeDark");

  // 폰트 크기 버튼
  const btnFontSmaller = document.getElementById("btnFontSmaller");
  const btnFontLarger = document.getElementById("btnFontLarger");

  // TTS 오디오 버튼
  const btnPlay = document.getElementById("btnTtsPlay");
  const btnPause = document.getElementById("btnTtsPause");
  const btnStop = document.getElementById("btnTtsStop");
  const rateSelect = document.getElementById("ttsRateSelect");
  const statusText = document.getElementById("ttsStatusText");

  if (!modal) return;

  // 뷰어 열기
  if (btnOpenEbook) {
    btnOpenEbook.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }

  // 오디오북 듣기 모드로 열기 (열리자마자 바로 재생)
  if (btnOpenAudio) {
    btnOpenAudio.addEventListener("click", () => {
      modal.classList.remove("hidden");
      startTtsPlayback();
    });
  }

  // 뷰어 닫기
  if (btnCloseEbook) {
    btnCloseEbook.addEventListener("click", () => {
      stopTtsPlayback();
      modal.classList.add("hidden");
    });
  }

  // 테마 전환
  if (btnLight) {
    btnLight.addEventListener("click", () => {
      windowEl.className = "ebook-modal-window";
    });
  }
  if (btnSepia) {
    btnSepia.addEventListener("click", () => {
      windowEl.className = "ebook-modal-window theme-sepia";
    });
  }
  if (btnDark) {
    btnDark.addEventListener("click", () => {
      windowEl.className = "ebook-modal-window theme-dark";
    });
  }

  // 폰트 크기 전환
  let currentFontMode = "normal";
  if (btnFontSmaller) {
    btnFontSmaller.addEventListener("click", () => {
      pageContainer.className = "ebook-page-container font-sm";
    });
  }
  if (btnFontLarger) {
    btnFontLarger.addEventListener("click", () => {
      pageContainer.className = "ebook-page-container font-lg";
    });
  }

  // ---------------- Web Speech API TTS 로직 ----------------
  function getBookText() {
    const paragraphs = document.querySelectorAll("#ebookReadingZone .ebook-paragraph");
    let fullText = "갈림길의 대화. 권신찬 저. ";
    paragraphs.forEach(p => {
      fullText += p.innerText + " ";
    });
    return fullText;
  }

  function startTtsPlayback() {
    if (!("speechSynthesis" in window)) {
      alert("죄송합니다. 현재 브라우저가 음성 낭독 기능을 지원하지 않습니다.");
      return;
    }

    window.speechSynthesis.cancel(); // 이전 음성 취소

    const text = getBookText();
    ttsUtterance = new SpeechSynthesisUtterance(text);
    ttsUtterance.lang = "ko-KR";
    ttsUtterance.rate = parseFloat(rateSelect ? rateSelect.value : "1.0");

    ttsUtterance.onstart = () => {
      isTtsPlaying = true;
      if (statusText) statusText.innerText = "낭독 재생 중... 🎧";
    };

    ttsUtterance.onend = () => {
      isTtsPlaying = false;
      if (statusText) statusText.innerText = "낭독 완료";
    };

    ttsUtterance.onerror = () => {
      isTtsPlaying = false;
      if (statusText) statusText.innerText = "낭독 대기 중";
    };

    window.speechSynthesis.speak(ttsUtterance);
  }

  function pauseTtsPlayback() {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        if (statusText) statusText.innerText = "낭독 재생 중... 🎧";
      } else {
        window.speechSynthesis.pause();
        if (statusText) statusText.innerText = "일시정지됨 ⏸️";
      }
    }
  }

  function stopTtsPlayback() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      isTtsPlaying = false;
      if (statusText) statusText.innerText = "낭독 정지됨";
    }
  }

  if (btnPlay) btnPlay.addEventListener("click", startTtsPlayback);
  if (btnPause) btnPause.addEventListener("click", pauseTtsPlayback);
  if (btnStop) btnStop.addEventListener("click", stopTtsPlayback);

  if (rateSelect) {
    rateSelect.addEventListener("change", () => {
      if (window.speechSynthesis.speaking) {
        startTtsPlayback(); // 변경된 배속으로 다시 시작
      }
    });
  }
}

// ======================== 5. 구글 스프레드시트 연동 ========================
function initGoogleSheetIntegration() {
  const btnOpenModal = document.getElementById("btnOpenSheetModal");
  const btnCloseModal = document.getElementById("btnCloseSheetModal");
  const modal = document.getElementById("sheetModal");
  const btnSave = document.getElementById("btnSaveSheetUrl");
  const btnReset = document.getElementById("btnResetData");
  const sheetUrlInput = document.getElementById("sheetUrlInput");

  const savedUrl = localStorage.getItem("ocr_sheet_csv_url");
  if (savedUrl) {
    sheetUrlInput.value = savedUrl;
    fetchGoogleSheetData(savedUrl);
  }

  btnOpenModal.addEventListener("click", () => modal.classList.remove("hidden"));
  btnCloseModal.addEventListener("click", () => modal.classList.add("hidden"));

  btnSave.addEventListener("click", async () => {
    const url = sheetUrlInput.value.trim();
    if (!url) {
      alert("구글 시트 CSV 링크를 입력해 주세요.");
      return;
    }
    localStorage.setItem("ocr_sheet_csv_url", url);
    await fetchGoogleSheetData(url);
    modal.classList.add("hidden");
  });

  btnReset.addEventListener("click", () => {
    if (confirm("기본 샘플 데이터로 복원하시겠습니까?")) {
      localStorage.removeItem("ocr_sheet_csv_url");
      sheetUrlInput.value = "";
      state.inProgress = [...DEFAULT_IN_PROGRESS_BOOKS];
      state.newScans = [...DEFAULT_NEW_SCANS];
      renderAll();
      modal.classList.add("hidden");
      alert("기본 데이터로 복원되었습니다.");
    }
  });
}

async function fetchGoogleSheetData(csvUrl) {
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error("시트 데이터를 가져오지 못했습니다.");
    const text = await response.text();

    const rows = text.split("\n").map(r => r.trim()).filter(Boolean);
    if (rows.length < 2) return;

    const newInProgress = [];
    const newScansList = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(",").map(c => c.replace(/^"|"$/g, "").trim());
      if (cols.length < 3) continue;

      const type = cols[0];
      const title = cols[1];
      const author = cols[2];
      const rate = parseInt(cols[3] || "0", 10);
      const contributors = parseInt(cols[4] || "1", 10);
      const bg = cols[5] || "linear-gradient(135deg, #1e3a8a, #0f172a)";
      const category = cols[6] || "";

      if (type.includes("진행")) {
        newInProgress.push({
          id: newInProgress.length + 1,
          title, author, rate, contributors, bg
        });
      } else if (type.includes("신규")) {
        newScansList.push({
          id: 100 + newScansList.length + 1,
          title, author, category, bg: bg.includes("#") ? bg : "#1e3a8a"
        });
      }
    }

    if (newInProgress.length > 0) state.inProgress = newInProgress;
    if (newScansList.length > 0) state.newScans = newScansList;

    renderAll();
    alert("구글 스프레드시트 데이터가 성공적으로 반영되었습니다!");
  } catch (err) {
    console.error("구글 시트 연동 오류:", err);
    alert("구글 시트를 읽어오는 중 오류가 발생했습니다. '웹에 게시' 링크가 CSV 형식인지 확인해 주세요.");
  }
}

// ======================== 6. 이벤트 핸들러 및 전체 렌더 ========================
function renderAll() {
  updateStatsOverview();
  renderBooksGrid();
  renderNewScans();
  renderHallOfFame();
}

function initEventHandlers() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      state.currentFilter = e.target.dataset.filter;
      renderBooksGrid();
    });
  });

  const searchInput = document.getElementById("searchRankingInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderHallOfFame(e.target.value);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  initVolunteerAuth();
  initEbookViewerAndAudio();
  initGoogleSheetIntegration();
  initEventHandlers();
});
