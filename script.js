const STORAGE_KEY = "caminha_plus_walks";

const splashScreen = document.getElementById("splashScreen");
const homeScreen = document.getElementById("homeScreen");
const enterBtn = document.getElementById("enterBtn");

const addBtn = document.getElementById("addBtn");
const modalOverlay = document.getElementById("modalOverlay");
const closeModalBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const walkForm = document.getElementById("walkForm");

const walkId = document.getElementById("walkId");
const dateInput = document.getElementById("date");
const partidaInput = document.getElementById("partida");
const chegadaInput = document.getElementById("chegada");
const distanceInput = document.getElementById("distance");
const weightInput = document.getElementById("weight");
const caloriePreview = document.getElementById("caloriePreview");
const modalTitle = document.getElementById("modalTitle");

const walkList = document.getElementById("walkList");
const emptyState = document.getElementById("emptyState");

const totalDistance = document.getElementById("totalDistance");
const averageCalories = document.getElementById("averageCalories");
const totalWalks = document.getElementById("totalWalks");

let walks = loadWalks();

function loadWalks() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error(
      "Erro ao carregar caminhadas:",
      error
    );

    return [];
  }
}

function saveWalks() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(walks)
  );
}

function formatNumber(value, decimals = 2) {
  return Number(value || 0).toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }
  );
}

function formatDate(dateString) {
  if (!dateString) {
    return "Data não informada";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "pt-BR"
  );
}

function calculateCalories(
  distance,
  weight
) {
  return (
    0.7 *
    Number(weight) *
    Number(distance)
  );
}

function renderWalks() {
  walkList.innerHTML = "";

  totalWalks.textContent =
    walks.length;

  const distanceSum =
    walks.reduce(
      (sum, walk) =>
        sum +
        Number(
          walk.distancia_em_km || 0
        ),
      0
    );

  const calories =
    walks.map(walk =>
      calculateCalories(
        walk.distancia_em_km,
        walk.peso_atual_kg
      )
    );

  const average =
    calories.length > 0
      ? calories.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / calories.length
      : 0;

  totalDistance.textContent =
    `${formatNumber(
      distanceSum
    )} km`;

  averageCalories.textContent =
    `${formatNumber(
      average
    )} kcal`;

  emptyState.classList.toggle(
    "hidden",
    walks.length !== 0
  );

  walks.forEach(walk => {
    const item =
      document.createElement(
        "article"
      );

    item.className =
      "walk-item";

    item.dataset.id =
      walk.id;

    const kcal =
      calculateCalories(
        walk.distancia_em_km,
        walk.peso_atual_kg
      );

    item.innerHTML = `
      <div class="walk-main">
        <div class="walk-title">
          <span class="walk-icon">🥾</span>

          <span>
            ${escapeHTML(
              walk.partida
            )}
            →
            ${escapeHTML(
              walk.chegada
            )}
          </span>
        </div>

        <div class="walk-meta">
          ${formatDate(walk.data)}
          |
          ${formatNumber(
            walk.distancia_em_km
          )} km
          |
          ${formatNumber(
            walk.peso_atual_kg,
            1
          )} kg
        </div>
      </div>

      <div class="walk-value">
        <strong>
          ${formatNumber(
            kcal
          )} kcal
        </strong>

        <span>
          gasto estimado
        </span>
      </div>

      <button
        class="delete-btn"
        type="button"
        data-action="delete"
        aria-label="Excluir caminhada"
        title="Excluir"
      >
        ×
      </button>
    `;

    item.addEventListener(
      "click",
      event => {
        if (
          event.target.closest(
            "[data-action='delete']"
          )
        ) {
          return;
        }

        openEditModal(
          walk.id
        );
      }
    );

    item
      .querySelector(
        "[data-action='delete']"
      )
      .addEventListener(
        "click",
        event => {
          event.stopPropagation();

          deleteWalk(
            walk.id
          );
        }
      );

    walkList.appendChild(
      item
    );
  });
}

function escapeHTML(text) {
  return String(text)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function getToday() {
  const now =
    new Date();

  const local =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() *
        60000
    );

  return local
    .toISOString()
    .slice(0, 10);
}

function openNewModal() {
  modalTitle.textContent =
    "Nova caminhada";

  walkForm.reset();

  walkId.value = "";

  dateInput.value =
    getToday();

  caloriePreview.textContent =
    "0,00 kcal";

  modalOverlay.classList.remove(
    "hidden"
  );

  setTimeout(
    () =>
      partidaInput.focus(),
    50
  );
}

function openEditModal(id) {
  const walk =
    walks.find(
      item =>
        item.id === id
    );

  if (!walk) return;

  modalTitle.textContent =
    "Editar caminhada";

  walkId.value =
    walk.id;

  dateInput.value =
    walk.data;

  partidaInput.value =
    walk.partida;

  chegadaInput.value =
    walk.chegada;

  distanceInput.value =
    walk.distancia_em_km;

  weightInput.value =
    walk.peso_atual_kg;

  updateCaloriePreview();

  modalOverlay.classList.remove(
    "hidden"
  );
}

function closeModal() {
  modalOverlay.classList.add(
    "hidden"
  );

  walkForm.reset();

  walkId.value = "";
}

function deleteWalk(id) {
  const walk =
    walks.find(
      item =>
        item.id === id
    );

  if (!walk) return;

  const confirmed =
    confirm(
      `Excluir a caminhada "${walk.partida} → ${walk.chegada}"?`
    );

  if (!confirmed) return;

  walks =
    walks.filter(
      item =>
        item.id !== id
    );

  saveWalks();

  renderWalks();
}

function updateCaloriePreview() {
  const distance =
    Number(
      distanceInput.value
    );

  const weight =
    Number(
      weightInput.value
    );

  if (!distance || !weight) {
    caloriePreview.textContent =
      "0,00 kcal";

    return;
  }

  caloriePreview.textContent =
    `${formatNumber(
      calculateCalories(
        distance,
        weight
      )
    )} kcal`;
}

function enterHome() {
  splashScreen.classList.add(
    "hidden"
  );

  homeScreen.classList.remove(
    "hidden"
  );

  renderWalks();
}

walkForm.addEventListener(
  "submit",
  event => {
    event.preventDefault();

    const data = {
      data:
        dateInput.value,

      partida:
        partidaInput.value.trim(),

      chegada:
        chegadaInput.value.trim(),

      distancia_em_km:
        Number(
          distanceInput.value
        ),

      peso_atual_kg:
        Number(
          weightInput.value
        )
    };

    if (
      !data.data ||
      !data.partida ||
      !data.chegada ||
      data.distancia_em_km <= 0 ||
      data.peso_atual_kg <= 0
    ) {
      alert(
        "Preencha todos os campos corretamente."
      );

      return;
    }

    if (walkId.value) {
      const index =
        walks.findIndex(
          item =>
            item.id ===
            walkId.value
        );

      if (index !== -1) {
        walks[index] = {
          ...walks[index],
          ...data
        };
      }
    } else {
      walks.unshift({
        id:
          `${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`,

        ...data
      });
    }

    saveWalks();

    renderWalks();

    closeModal();
  }
);

enterBtn.addEventListener(
  "click",
  enterHome
);

addBtn.addEventListener(
  "click",
  openNewModal
);

closeModalBtn.addEventListener(
  "click",
  closeModal
);

cancelBtn.addEventListener(
  "click",
  closeModal
);

modalOverlay.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      modalOverlay
    ) {
      closeModal();
    }
  }
);

distanceInput.addEventListener(
  "input",
  updateCaloriePreview
);

weightInput.addEventListener(
  "input",
  updateCaloriePreview
);

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      !modalOverlay.classList.contains(
        "hidden"
      )
    ) {
      closeModal();
    }
  }
);

renderWalks();