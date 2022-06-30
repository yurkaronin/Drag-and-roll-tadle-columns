

document.addEventListener('DOMContentLoaded', function () {
  // находим нашу таблицу
  const table = document.getElementById('table');
  // перетаскиваемый элемент
  let draggingEle;
  let draggingColumnIndex;
  let placeholder;
  let list;
  let isDraggingStarted = false;

  // Текущее положение мыши относительно перетаскиваемого элемента
  let x = 0;
  let y = 0;

  // Поменяйте местами два узла
  const swap = function (nodeA, nodeB) {
      const parentA = nodeA.parentNode;
      const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

      // Переместите `узелА` перед `узломВ`.
      nodeB.parentNode.insertBefore(nodeA, nodeB);

      // Переместите `nodeB` до сиблинга `nodeA`.
      parentA.insertBefore(nodeB, siblingA);
  };

  // Проверьте, находится ли `nodeA` слева от `nodeB`.
  const isOnLeft = function (nodeA, nodeB) {
      // Получение ограничивающего прямоугольника узлов
      const rectA = nodeA.getBoundingClientRect();
      const rectB = nodeB.getBoundingClientRect();

      return rectA.left + rectA.width / 2 < rectB.left + rectB.width / 2;
  };

  const cloneTable = function () {
      const rect = table.getBoundingClientRect();

      list = document.createElement('div');
      list.classList.add('clone-list');
      list.style.position = 'absolute';
      list.style.left = `${rect.left}px`;
      list.style.top = `${rect.top}px`;
      table.parentNode.insertBefore(list, table);

      // Скрыть исходную таблицу
      table.style.visibility = 'hidden';

      // Получить все ячейки
      const originalCells = [].slice.call(table.querySelectorAll('tbody td'));

      const originalHeaderCells = [].slice.call(table.querySelectorAll('th'));
      const numColumns = originalHeaderCells.length;

      // Перебор ячеек заголовка
      originalHeaderCells.forEach(function (headerCell, headerIndex) {
          const width = parseInt(window.getComputedStyle(headerCell).width);

          // Создаем новую таблицу из заданной строки
          const item = document.createElement('div');
          item.classList.add('draggable');

          const newTable = document.createElement('table');
          newTable.setAttribute('class', 'clone-table');
          newTable.style.width = `${width}px`;

          // Заголовок
          const th = headerCell.cloneNode(true);
          let newRow = document.createElement('tr');
          newRow.appendChild(th);
          newTable.appendChild(newRow);

          const cells = originalCells.filter(function (c, idx) {
              return (idx - headerIndex) % numColumns === 0;
          });
          cells.forEach(function (cell) {
              const newCell = cell.cloneNode(true);
              newCell.style.width = `${width}px`;
              newRow = document.createElement('tr');
              newRow.appendChild(newCell);
              newTable.appendChild(newRow);
          });

          item.appendChild(newTable);
          list.appendChild(item);
      });
  };

  const mouseDownHandler = function (e) {
      draggingColumnIndex = [].slice.call(table.querySelectorAll('th')).indexOf(e.target);

      // Определите положение мыши
      x = e.clientX - e.target.offsetLeft;
      y = e.clientY - e.target.offsetTop;

      // Прикрепить слушателей к `document`.
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
      if (!isDraggingStarted) {
          isDraggingStarted = true;

          cloneTable();

          draggingEle = [].slice.call(list.children)[draggingColumnIndex];
          draggingEle.classList.add('dragging');

          // Пусть заполнитель займет высоту перетаскиваемого элемента.
          // Чтобы следующий элемент не перемещался влево или вправо.
          // чтобы заполнить пространство перетаскиваемого элемента
          placeholder = document.createElement('div');
          placeholder.classList.add('placeholder');
          draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
          placeholder.style.width = `${draggingEle.offsetWidth}px`;
      }

      // Установите позицию для перетаскивания элемента
      draggingEle.style.position = 'absolute';
      draggingEle.style.top = `${draggingEle.offsetTop + e.clientY - y}px`;
      draggingEle.style.left = `${draggingEle.offsetLeft + e.clientX - x}px`;

      // Переназначить положение мыши
      x = e.clientX;
      y = e.clientY;

      // Текущий порядок
      // prevEle
      // draggingEle
      // placeholder
      // nextEle
      const prevEle = draggingEle.previousElementSibling;
      const nextEle = placeholder.nextElementSibling;

      // // Перетаскиваемый элемент находится над предыдущим элементом
      // // Пользователь перемещает перетаскиваемый элемент влево
      if (prevEle && isOnLeft(draggingEle, prevEle)) {
          // The current order    -> The new order
          // prevEle              -> placeholder
          // draggingEle          -> draggingEle
          // placeholder          -> prevEle
          swap(placeholder, draggingEle);
          swap(placeholder, prevEle);
          return;
      }

      // Перетаскиваемый элемент находится ниже следующего элемента
      // Пользователь перемещает перетаскиваемый элемент в самый низ
      if (nextEle && isOnLeft(nextEle, draggingEle)) {
          // The current order    -> The new order
          // draggingEle          -> nextEle
          // placeholder          -> placeholder
          // nextEle              -> draggingEle
          swap(nextEle, placeholder);
          swap(nextEle, draggingEle);
      }
  };

  const mouseUpHandler = function () {
      // // Удалите заполнитель
      placeholder && placeholder.parentNode.removeChild(placeholder);

      draggingEle.classList.remove('dragging');
      draggingEle.style.removeProperty('top');
      draggingEle.style.removeProperty('left');
      draggingEle.style.removeProperty('position');

      // Получить конечный индекс
      const endColumnIndex = [].slice.call(list.children).indexOf(draggingEle);

      isDraggingStarted = false;

      // Удалите элемент `list`.
      list.parentNode.removeChild(list);

      // Переместите перетаскиваемый столбец в `endColumnIndex`.
      table.querySelectorAll('tr').forEach(function (row) {
          const cells = [].slice.call(row.querySelectorAll('th, td'));
          draggingColumnIndex > endColumnIndex
              ? cells[endColumnIndex].parentNode.insertBefore(
                    cells[draggingColumnIndex],
                    cells[endColumnIndex]
                )
              : cells[endColumnIndex].parentNode.insertBefore(
                    cells[draggingColumnIndex],
                    cells[endColumnIndex].nextSibling
                );
      });

      // Вернуть таблицу
      table.style.removeProperty('visibility');

      // Удалите обработчики `mousemove` и `mouseup`.
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
  };

  table.querySelectorAll('th').forEach(function (headerCell) {
      headerCell.classList.add('draggable');
      headerCell.addEventListener('mousedown', mouseDownHandler);
  });
});
