// Основной файл скриптов проекта

document.addEventListener('DOMContentLoaded', function () {
  var cells = document.querySelectorAll('.cell-category');
  var mobileButton = document.querySelector('.mobile-button');
  var mobileButtonText = mobileButton
    ? mobileButton.querySelector('.special-body')
    : null;
  var mobileButtonIcons = mobileButton
    ? mobileButton.querySelector('.mobile-button-icons')
    : null;
  var selectionOrder = [];
  var infoButtons = document.querySelectorAll('.info-button');
  var ghostSheet = document.getElementById('ghost-sheet');
  var ghostPanel = ghostSheet
    ? ghostSheet.querySelector('.bottom-sheet__panel')
    : null;
  var ghostBackdrop = ghostSheet
    ? ghostSheet.querySelector('.bottom-sheet__backdrop')
    : null;
  var ghostContents = ghostSheet
    ? ghostSheet.querySelectorAll('.bottom-sheet__content')
    : null;
  var ghostDragStartY = null;
  var ghostDragCurrentY = null;

  // Карты иконок для экрана статуса / главного экрана
  var categoryIconsIndex = {
    'help-health': './assets/img/icon-segment-health.png',
    'help-supermarket': './assets/img/icon-segment-supermarket.png',
    'help-greenday': './assets/img/icon-segment-greenday.png',
    'help-clothes': './assets/img/icon-segment-clothes.png',
    'help-azs': './assets/img/icon-segment-azs.png',
    'help-beauty': './assets/img/icon-segment-beauty.png',
    'help-taxi': './assets/img/icon-segment-taxi.png',
    'help-zoo': './assets/img/icon-segment-zoo.png',
    'help-gazpromneft': './assets/img/icon-partner-gazpromneft.png',
    'help-rivgosh': './assets/img/icon-partner-rivgosh.png',
    'help-burger-king': './assets/img/icon-partner-burgerking.png',
    'help-sela': './assets/img/icon-partner-sela.png',
    'help-kari': './assets/img/icon-partner-karin.png'
  };

  // Карты "длинных" картинок для index2.html (category-card)
  var categoryLongIcons = {
    'help-health': './assets/img/long/SEGMENTS_LOY_HEALTH.png',
    'help-supermarket': './assets/img/long/SEGMENTS_LOY_SUPERMARKET.png',
    'help-greenday': './assets/img/long/SEGMENTS_LOY_GREENDAY.png',
    'help-clothes': './assets/img/long/SEGMENTS_LOY_CLOTHES.png',
    'help-azs': './assets/img/long/SEGMENTS_LOY_AZS.png',
    'help-beauty': './assets/img/long/SEGMENTS_LOY_BEAUTY.png',
    'help-taxi': './assets/img/long/SEGMENTS_LOY_TAXI.png',
    'help-zoo': './assets/img/long/SEGMENTS_LOY_ZOO.png',
    'help-gazpromneft': './assets/img/long/PARTNER_LOY_2.png',
    'help-rivgosh': './assets/img/long/PARTNER_LOY_RIVGOSH.png',
    'help-burger-king': './assets/img/long/PARTNER_LOY_BURGER_KING.png',
    'help-sela': './assets/img/long/PARTNER_LOY_SELA.png',
    'help-kari': './assets/img/long/PARTNER_LOY_KARIN.png'
  };

  // Шаблон цветов фона для карточек категорий (index2.html, category-card).
  // Цвета заданы произвольно, при необходимости легко поменять.
  var categoryLongBackgrounds = {
    'help-health': '#F7E4F3',
    'help-supermarket': '#ECE9A4',
    'help-greenday': '#E0FFE0',
    'help-clothes': '#DEE9FF',
    'help-azs': '#D9F6A2',
    'help-beauty': '#FFD9E6',
    'help-taxi': '#EBE1C8',
    'help-zoo': '#FEE1D2',
    'help-gazpromneft': '#E1F3F7',
    'help-rivgosh': '#F6DDEB',
    'help-burger-king': '#CAE3F8',
    'help-sela': '#9EFFC3',
    'help-kari': '#F4E3FF'
  };

  // Шаблон значений процента для карточек (index2.html, category-card).
  // Здесь можно настроить, какие именно цифры (и формат) показывать на длинных карточках.
  var categoryLongPercents = {
    'help-health': '2%',
    'help-supermarket': '2%',
    'help-greenday': '100%',
    'help-clothes': '3%',
    'help-azs': '5%',
    'help-beauty': '8%',
    'help-taxi': '5%',
    'help-zoo': '4%',
    'help-gazpromneft': '7%',
    'help-rivgosh': '15%',
    'help-burger-king': '10%',
    'help-sela': '20%',
    'help-kari': '5%'
  };

  function updateMobileButton() {
    if (!mobileButtonIcons || !mobileButtonText) return;

    var activeCells = selectionOrder.filter(function (cell) {
      return cell.classList && cell.classList.contains('cell-category--active');
    });

    // обновляем текст и цвет кнопки
    var count = activeCells.length;
    if (count >= 3) {
      mobileButtonText.textContent = 'Подключить';
      if (mobileButton) {
        mobileButton.classList.add('mobile-button--primary');
        mobileButton.classList.remove('mobile-button--empty');
        mobileButton.setAttribute('aria-disabled', 'false');
      }
    } else {
      if (count === 0) {
        mobileButtonText.textContent = 'Выберите не менее 3 категорий';
        if (mobileButton) {
          mobileButton.classList.add('mobile-button--empty');
        }
      } else {
        mobileButtonText.textContent = 'Выбрано ' + count;
        if (mobileButton) {
          mobileButton.classList.remove('mobile-button--empty');
        }
      }
      if (mobileButton) {
        mobileButton.classList.remove('mobile-button--primary');
        mobileButton.setAttribute('aria-disabled', 'true');
      }
    }

    // собираем данные по иконкам
    mobileButtonIcons.innerHTML = '';

    var iconsData = [];

    activeCells.forEach(function (cell) {
      var iconImg = cell.querySelector('.cell-icon img');
      if (!iconImg) return;
      iconsData.push({
        src: iconImg.getAttribute('src'),
        alt: iconImg.getAttribute('alt') || ''
      });
    });

    var containerWidth = mobileButtonIcons.getBoundingClientRect().width;
    var iconWidth = 44;
    var minOverlap = 6;
    var maxOverlap = 16;

    var totalCount = iconsData.length;

    if (totalCount === 0 || containerWidth <= 0) {
      mobileButtonIcons.style.setProperty('--icon-overlap', '-6px');
      return;
    }

    // Ищем максимальное число видимых иконок, при котором
    // для наложения в диапазоне [6,16] всё ещё хватает места.
    var bestVisible = 0;
    var bestExtra = 0;
    var bestOverlap = -6;

    function totalWidth(slots, overlap) {
      if (slots <= 0) return 0;
      if (slots === 1) return iconWidth;
      var step = iconWidth - overlap;
      return iconWidth + (slots - 1) * step;
    }

    for (var visible = totalCount; visible >= 1; visible--) {
      var extra = totalCount - visible;
      var slots = visible + (extra > 0 ? 1 : 0); // иконки + "+N", если нужно

      if (slots === 1) {
        if (totalWidth(1, 0) <= containerWidth) {
          bestVisible = visible;
          bestExtra = extra;
          bestOverlap = 0;
          break;
        }
        continue;
      }

      // Проверяем, можно ли уместить с максимальным наложением (16px).
      if (totalWidth(slots, maxOverlap) > containerWidth) {
        // Даже при максимальном наложении всё не влазит — нужно меньше видимых.
        continue;
      }

      // Считаем наложение, при котором группа ровно займёт ширину.
      var rawOverlap =
        iconWidth - (containerWidth - iconWidth) / (slots - 1);
      var overlap = Math.max(minOverlap, Math.min(maxOverlap, rawOverlap));

      bestVisible = visible;
      bestExtra = extra;
      bestOverlap = -overlap;

      // Мы идём от максимального числа иконок к меньшему,
      // поэтому первый подходящий вариант и есть оптимальный.
      break;
    }

    if (bestVisible === 0) {
      // Запасной вариант: показываем одну иконку и "+N" без наложения.
      bestVisible = 1;
      bestExtra = totalCount - 1;
      bestOverlap = 0;
    }

    mobileButtonIcons.style.setProperty(
      '--icon-overlap',
      bestOverlap + 'px'
    );

    // отрисовываем иконки
    for (var i = 0; i < bestVisible; i++) {
      var data = iconsData[i];
      var wrapper = document.createElement('div');
      wrapper.className = 'mobile-button-icon';

      var img = document.createElement('img');
      img.src = data.src;
      img.alt = data.alt;
      wrapper.appendChild(img);
      mobileButtonIcons.appendChild(wrapper);
    }

    if (bestExtra > 0) {
      var extraWrapper = document.createElement('div');
      extraWrapper.className = 'mobile-button-icon mobile-button-icon--more';
      extraWrapper.textContent = '+' + bestExtra;
      mobileButtonIcons.appendChild(extraWrapper);
    }
  }

  function openGhostSheet(helpId) {
    if (!ghostSheet || !ghostPanel || !ghostContents) return;

    ghostContents.forEach(function (content) {
      content.classList.remove('bottom-sheet__content--active');
    });

    var target = helpId
      ? ghostSheet.querySelector('#' + helpId)
      : null;

    if (!target && ghostContents.length > 0) {
      target = ghostContents[0];
    }

    if (target) {
      target.classList.add('bottom-sheet__content--active');
    }
    ghostSheet.classList.add('bottom-sheet--open');
    document.body.classList.add('bottom-sheet-open');
    ghostSheet.setAttribute('aria-hidden', 'false');
  }

  function closeGhostSheet() {
    if (!ghostSheet || !ghostPanel) return;
    ghostSheet.classList.remove('bottom-sheet--open');
    document.body.classList.remove('bottom-sheet-open');
    ghostSheet.setAttribute('aria-hidden', 'true');
    ghostPanel.style.transform = '';
    ghostDragStartY = null;
    ghostDragCurrentY = null;
  }

  function onGhostPointerDown(evt) {
    ghostDragStartY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    ghostDragCurrentY = ghostDragStartY;
  }

  function onGhostPointerMove(evt) {
    if (ghostDragStartY == null || !ghostPanel) return;
    // Блокируем нативный скролл страницы (особенно на Android)
    if (evt.cancelable) {
      evt.preventDefault();
    }
    var y = evt.touches ? evt.touches[0].clientY : evt.clientY;
    ghostDragCurrentY = y;
    var delta = Math.max(0, y - ghostDragStartY);
    ghostPanel.style.transform = 'translateY(' + delta + 'px)';
  }

  function onGhostPointerUp() {
    if (ghostDragStartY == null || !ghostPanel) return;
    var delta = ghostDragCurrentY - ghostDragStartY;
    if (delta > 80) {
      closeGhostSheet();
    } else {
      ghostPanel.style.transform = '';
    }
    ghostDragStartY = null;
    ghostDragCurrentY = null;
  }

  // Сохраняем выбранные категории из экрана выбора
  function saveSelectedCategories() {
    if (!selectionOrder.length) return;

    var selected = selectionOrder
      .filter(function (cell) {
        return (
          cell.classList &&
          cell.classList.contains('cell-category--active')
        );
      })
      .map(function (cell) {
        var helpId = cell.getAttribute('data-help-id') || '';
        var titleEl = cell.querySelector('.cell-text .body1');
        var title = titleEl ? titleEl.textContent.trim() : '';
        return {
          id: helpId,
          title: title
        };
      })
      .filter(function (item) {
        return item.id;
      });

    try {
      localStorage.setItem(
        'selectedCategories',
        JSON.stringify(selected)
      );
    } catch (e) {
      // игнорируем ошибки localStorage
    }
  }

  // Рендер выбранных категорий на главном экране (index.html)
  function renderSelectedCategoriesOnIndex() {
    var container = document.querySelector(
      '[data-role="selected-categories"]'
    );
    if (!container) return;

    var raw = null;
    try {
      raw = localStorage.getItem('selectedCategories');
    } catch (e) {
      raw = null;
    }

    if (!raw) return;

    var items = [];
    try {
      items = JSON.parse(raw) || [];
    } catch (e) {
      items = [];
    }

    if (!Array.isArray(items) || !items.length) return;

    container.innerHTML = '';

    items.forEach(function (item) {
      var title = item.title || '';
      var percent = '';
      var label = title;

      // ожидаем строки вида "5% Такси и каршеринг"
      var parts = title.split(' ');
      if (parts.length > 1) {
        percent = parts[0];
        label = parts.slice(1).join(' ');
      }

      var card = document.createElement('article');
      card.className = 'index-category-card';

      var iconWrapper = document.createElement('div');
      iconWrapper.className = 'index-category-card__icon';

      var iconSrc = categoryIconsIndex[item.id];
      if (iconSrc) {
        var img = document.createElement('img');
        img.src = iconSrc;
        img.alt = label || '';
        iconWrapper.appendChild(img);
      }

      var textWrapper = document.createElement('div');
      textWrapper.className = 'index-category-card__text';

      var pPercent = document.createElement('p');
      pPercent.className = 'caption text-primary';
      pPercent.textContent = percent;

      var pLabel = document.createElement('p');
      pLabel.className = 'body1 text-primary';
      pLabel.textContent = label || '';

      textWrapper.appendChild(pPercent);
      textWrapper.appendChild(pLabel);

      card.appendChild(iconWrapper);
      card.appendChild(textWrapper);
      container.appendChild(card);
    });
  }

  // Рендер выбранных категорий в виде "длинных" карточек (index2.html, .category-row)
  function renderSelectedCategoriesForCategoryRow() {
    var container = document.querySelector(
      '.category-row[data-role="selected-categories-long"]'
    );
    if (!container) return;

    var raw = null;
    try {
      raw = localStorage.getItem('selectedCategories');
    } catch (e) {
      raw = null;
    }

    if (!raw) return;

    var items = [];
    try {
      items = JSON.parse(raw) || [];
    } catch (e) {
      items = [];
    }

    if (!Array.isArray(items) || !items.length) return;

    // если есть данные, заменяем заглушки
    container.innerHTML = '';

    items.forEach(function (item) {
      var title = item.title || '';

      // В первую очередь берём процент из шаблона categoryLongPercents,
      // чтобы можно было настраивать отображаемое значение вручную.
      var percent = categoryLongPercents[item.id] || '';

      // Фолбэк: если в шаблоне процента нет, пробуем достать его из title
      if (!percent) {
        var parts = title.split(' ');
        if (parts.length > 0) {
          percent = parts[0];
        }
      }

      var imgSrc = categoryLongIcons[item.id];

      var card = document.createElement('article');
      card.className = 'category-card';

       // Применяем цвет фона из шаблона (произвольные значения,
       // которые можно легко поменять в categoryLongBackgrounds)
       var bg = categoryLongBackgrounds[item.id];
       if (bg) {
         card.style.backgroundColor = bg;
       }

      if (imgSrc) {
        var img = document.createElement('img');
        img.src = imgSrc;
        img.alt = title;
        card.appendChild(img);
      }

      var p = document.createElement('p');
      p.className = 'footnote1 text-primary';
      p.textContent = percent;
      card.appendChild(p);

      container.appendChild(card);
    });
  }

  // Тоггл чекбокса по клику на всю ячейку (кроме help-иконки)
  cells.forEach(function (cell) {
    // Не вешаем обработчик на задизейбленные ячейки
    if (cell.classList.contains('cell-category--disabled')) {
      return;
    }

    cell.addEventListener('click', function (event) {
      // Если клик был по кнопке help (info-button), не трогаем состояние категории
      if (event.target.closest('.info-button')) {
        return;
      }
      var inBankModule =
        cell.closest('[data-name="Section Module Bank"]') !== null;

      if (inBankModule) {
        var bankSection = cell.closest('[data-name="Section Module Bank"]');
        var currentActive = bankSection.querySelectorAll(
          '.cell-category.cell-category--active'
        ).length;
        var isCurrentlyActive = cell.classList.contains(
          'cell-category--active'
        );

        // Если пытаемся включить новую категорию и уже выбрано 3 — просто выходим.
        if (!isCurrentlyActive && currentActive >= 3) {
          return;
        }
      }

      var isActive = cell.classList.toggle('cell-category--active');

      if (isActive) {
        // добавляем в порядок, если ещё нет
        if (selectionOrder.indexOf(cell) === -1) {
          selectionOrder.push(cell);
        }
      } else {
        // удаляем из порядка
        var idx = selectionOrder.indexOf(cell);
        if (idx !== -1) {
          selectionOrder.splice(idx, 1);
        }
      }

      if (inBankModule) {
        var bankSectionAfter = cell.closest('[data-name="Section Module Bank"]');
        var bankCells = bankSectionAfter.querySelectorAll('.cell-category');
        var activeInBank = bankSectionAfter.querySelectorAll(
          '.cell-category.cell-category--active'
        ).length;

        bankCells.forEach(function (bankCell) {
          if (activeInBank >= 3) {
            if (!bankCell.classList.contains('cell-category--active')) {
              bankCell.classList.add('cell-category--disabled');
            } else {
              bankCell.classList.remove('cell-category--disabled');
            }
          } else {
            bankCell.classList.remove('cell-category--disabled');
          }
        });
      }

      updateMobileButton();
    });
  });

  if (infoButtons.length && ghostSheet && ghostPanel) {
    infoButtons.forEach(function (btn) {
      btn.addEventListener('click', function (evt) {
        // чтобы клик по help не активировал ячейку
        evt.stopPropagation();
        var cell = btn.closest('.cell-category');
        var helpId = cell ? cell.getAttribute('data-help-id') : null;
        openGhostSheet(helpId);
      });
    });

    if (ghostBackdrop) {
      ghostBackdrop.addEventListener('click', function () {
        closeGhostSheet();
      });
    }

    ghostPanel.addEventListener('touchstart', onGhostPointerDown);
    ghostPanel.addEventListener('touchmove', onGhostPointerMove);
    ghostPanel.addEventListener('touchend', onGhostPointerUp);
    ghostPanel.addEventListener('mousedown', onGhostPointerDown);
    window.addEventListener('mousemove', onGhostPointerMove);
    window.addEventListener('mouseup', onGhostPointerUp);

    document.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape') {
        closeGhostSheet();
      }
    });
  }

  // начальное состояние
  updateMobileButton();

  // переход на страницу статуса по клику по зелёной кнопке
  if (mobileButton) {
    mobileButton.addEventListener('click', function (evt) {
      // Если кнопка ещё не активна, блокируем переход по ссылке
      if (!mobileButton.classList.contains('mobile-button--primary')) {
        evt.preventDefault();
        return;
      }

    // Если есть выбранные категории брендов (Section Module Brand),
    // отправляем цели Яндекс.Метрики при переходе на следующий экран.
      var brandSection = document.querySelector(
        '[data-name="Section Module Brand"]'
      );
      if (brandSection) {
      var brandCells = brandSection.querySelectorAll('.cell-category');
      var activeBrands = brandSection.querySelectorAll(
        '.cell-category.cell-category--active'
      );

      if (activeBrands.length > 0 && typeof ym === 'function') {
        try {
          // Есть хотя бы одна выбранная брендовая категория
          console.log('[ym] goal: choose_brand');
          ym(106845526, 'reachGoal', 'choose_brand');

          // Если выбраны все бренды в этом блоке — отправляем дополнительную цель
          if (brandCells.length > 0 &&
              activeBrands.length === brandCells.length) {
            console.log('[ym] goal: choose_all_brand');
            ym(106845526, 'reachGoal', 'choose_all_brand');
          }
        } catch (e) {
          // безопасно игнорируем ошибки Метрики
          console.warn('YM goal send error', e);
        }
      }
      }

      // Сохраняем выбранные категории и даём ссылке перейти на status.html
      saveSelectedCategories();
    });
  }

  // если мы на главном экране, отрисуем выбранные категории
  renderSelectedCategoriesOnIndex();

  // если на index2.html есть category-row для выбранных категорий — заполним её
  renderSelectedCategoriesForCategoryRow();

  // Настройка ширины category-card в category-row:
  // в один экран помещается не более 5 карточек,
  // а если их меньше — ширина перерассчитывается под фактическое количество.
  (function setupCategoryRows() {
    var rows = document.querySelectorAll('.category-row');
    if (!rows.length) return;

    rows.forEach(function (row) {
      var cards = row.querySelectorAll('.category-card');
      if (!cards.length) return;

      var visibleCount = Math.min(5, cards.length);
      row.style.setProperty('--category-visible-count', String(visibleCount));
    });
  })();

  // Добавляем/убираем фон навигации в зависимости от прокрутки
  (function setupNavigationScrollState() {
    var nav = document.querySelector('.navigation');
    if (!nav) return;

    function updateNavState() {
      if (window.scrollY > 0) {
        nav.classList.add('navigation--scrolled');
      } else {
        nav.classList.remove('navigation--scrolled');
      }
    }

    window.addEventListener('scroll', updateNavState, { passive: true });
    updateNavState();
  })();
});

