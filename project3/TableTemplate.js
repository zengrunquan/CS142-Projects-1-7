'use strict'

class TableTemplate {
    // 接收 <table> 的id，字典对象，字符串（列名）
    static fillIn(tabled, dictionary, columnName = null) {
        // 获取指定id的表格元素
        const table = document.getElementById(tabled);
        if (!table) return;

        // 查找标题行（处理可能存在的tbody，没有标题行直接返回）
        const headerRow = table.rows[0];
        if (!headerRow) return;

        // 处理标题行中的模板
        for (let i = 0; i < headerRow.cells.length; i++) {
            const cell = headerRow.cells[i];
            // 创建模板处理器实例，传入当前单元格文本内容
            const processor = new Cs142TemplateProcessor(cell.textContent);
            // 使用字典替换模板，并更新单元格内容
            cell.textContent = processor.fillIn(dictionary);
        }

        // 如果指定了columnName，找到对应列的索引
        let columnIndex = -1;
        if (columnName !== null) {
            for (let i = 0; i < headerRow.cells.length; i++) {
                if (headerRow.cells[i].textContent === columnName) {
                    columnIndex = i;  // 找到匹配列，记录索引
                    break;
                }
            }

            // 如果没找到匹配的列名，直接返回（但标题行已经处理）
            if (columnIndex === -1) {
                table.style.visibility = 'visible';  // 将表格更改为可见
                return;
            }
        }

        // 处理表格内容行（从第二行开始）
        for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i];
            if (columnName === null) {
                // 如果未指定columnName，处理整行所有单元格
                for (let j = 0; j < row.cells.length; j++) {
                    const cell = row.cells[j];
                    const processor = new Cs142TemplateProcessor(cell.textContent);
                    cell.textContent = processor.fillIn(dictionary);
                }
            } else {
                // 如果指定了columnName，只处理对应列的单元格
                    const cell = row.cells[columnIndex];
                    const processor = new Cs142TemplateProcessor(cell.textContent);
                    cell.textContent = processor.fillIn(dictionary);
            }
        }

        // 确保表格可见（无论原始状态如何）
        table.style.visibility = 'visible';
    }
}