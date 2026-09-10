'use strict'

class DatePicker {
    // 构造函数 ---> 初始化对象基本属性
    constructor(divId, callback) {
        this.divId = divId;        // 存储目标div的id ---> datepicker1, datepicker2
        this.callback = callback;  // 存储日期选择的回调函数 ---> 当用户选择一个日期，会触发回调
        this.currentDate = null;   // 存储当前显示的月份 ---> 后续通过render更新当前月份
        this.today = new Date();   // 存储今天的日期（固定不变）---> 用new Date()获取电脑系统的日期
    }

    // 日历渲染入口
    render(date) {
        this.currentDate = new Date(date);  // 更新当前显示的月份
        const div = document.getElementById(this.divId);  // 获取目标div
        if (!div) return;  // 如果div不存在，直接退出
        div.innerHTML = this.generateCalendarHTML();  // 生成日历HTML并插入div
        this.setupEventListeners();  // 为日历添加点击事件
    }

    // 日历HTML生成
    generateCalendarHTML() {
        const year = this.currentDate.getFullYear();  // 当前显示的年份（）
        const month = this.currentDate.getMonth();    // 当前显示的月份（0-11, 0-->1, 11-->12）
        
        // 判断当前显示的月份是否是“用户当天日期”，用于标记当日
        const isCurrentMonth = this.today.getFullYear() === year && this.today.getMonth() === month;
        const todayDate = this.today.getDate();  // 当日日期
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // 计算逻辑 月天数 ---> 通过 new Date(year, month+1, 0) 即下个月第0天 同样等价于 上个月最后一天 所以可以通过getDate()获取天数
        // 判断当月第一天是星期几 ---> 同样通过 new Date(year, month, 1) 即当月第一天1号，再通过 getDay() 返回0-6（0--周日，6-->周六）
        const daysInMonth = new Date(year, month + 1, 0).getDate();  // 当月的总天数
        const firstDayOfMonth = new Date(year, month, 1).getDay();   // 当月第一天是星期几

        let calendarHTML = `
            <div class="date-picker">
                <div class="header">
                    <button class="prev-month">&lt;</button>
                    <h2>${monthNames[month]} ${year}</h2>
                    <button class="next-month">&gt;</button>
                </div>
                <div class="weekdays">
                    <div>Su</div>
                    <div>Mo</div>
                    <div>Tu</div>
                    <div>We</div>
                    <div>Th</div>
                    <div>Fr</div>
                    <div>Sa</div>
                </div>
                <div class="days">
        `;

        // 添加上个月的日期 （如：当月1号是周二，需要补充周日，周一的日期）
        // 计算逻辑：假设当前月是7月，1号为周二即对应2，则要找到两个日子，7月的0号和-1号，对应为6月的最后两天29和30
        // 公式：0 - firstDayOfMonth + i + 1 得到-1, 0 再通过 getDate() 获取 29 和 30
        for (let i = 0; i < firstDayOfMonth; i++) {
            const prevMonthDay = new Date(year, month, 0 - firstDayOfMonth + i + 1).getDate();
            // 用 other-month 区别于当前月的日期，后面再用css特殊标记
            calendarHTML += `<div class="day other-month">${prevMonthDay}</div>`;
        }

        // 添加当月的日期 （1号到当月最后一天）
        for (let day = 1; day <= daysInMonth; day++) {
            // 判断用户当天使用该日历时的日期（（年，月）在isCurrentMonth已经判断，日期三个是否相同）
            const isToday = isCurrentMonth && day === todayDate;
            // 类名拼接：当前月（current-month）+ 若为当天日期则加到today类里面
            // today类额外添加特殊样式标注
            const classes = `day current-month ${isToday ? 'today' : ''}`;
            // data-day="${day}"自定义属性，用于后续点击获取日期
            calendarHTML += `<div class="${classes}" data-day="${day}">${day}</div>`;
        }

        // 添加下个月的日期
        // 计算需要补多少天才能凑满整周（如当月最后一天是周四，则需要补周五和周六）
        const totalDays = firstDayOfMonth + daysInMonth;  // 已显示的天数（上月补的 + 当月的）
        const nextMonthDays = 7 - (totalDays % 7);  // 需要补的下个月天数
        if (nextMonthDays < 7) {  // 当 nextMonthDays 为 7 天满周则不需要补，所以只需要确保 < 7
            for (let i = 1; i <= nextMonthDays; i++) {
                calendarHTML += `<div class="day other-month">${i}</div>`;
            }
        }

        calendarHTML += `
                </div>
            </div>
        `;
        return calendarHTML;
    }

    // 事件监听
    setupEventListeners() {
        const div = document.getElementById(this.divId);
        if (!div) return;

        // 为当前月的日期添加点击事件（获取当前月的所有日期元素）
        const currentMonthDays = div.querySelectorAll('.day.current-month');
        currentMonthDays.forEach(day => {
            day.addEventListener('click', () => {
                // 移除之前的选中状态（确保只有一个选中日期）
                div.querySelectorAll('.day.selected').forEach(selected => {
                    selected.classList.remove('selected');
                });
                
                // 给当前点击日期添加新的选中状态
                day.classList.add('selected');
                
                // 调用回调函数，传递选中日期
                const dayNum = parseInt(day.getAttribute('data-day'));  // 获取日期
                const selectedDate = {
                    month: this.currentDate.getMonth() + 1,  // 月份+1（因为js中月份是0-11）
                    day: dayNum,
                    year: this.currentDate.getFullYear()
                };
                this.callback(this.divId, selectedDate);  // 触发回调，通知外部（如控制台会console.log选中的日期）
            });
        });

        // 为导航按钮添加点击事件 获取上个月，下个月的按钮
        const prevBtn = div.querySelector('.prev-month');
        const nextBtn = div.querySelector('.next-month');
        
        // 点击上个月按钮：显示当前月的前一个月
        prevBtn.addEventListener('click', () => {
            const newDate = new Date(this.currentDate);  // 复制当前日期
            newDate.setMonth(newDate.getMonth() - 1);  // 月份减1
            this.render(newDate);  // 重新渲染日历
        });
        
        // 同理
        nextBtn.addEventListener('click', () => {
            const newDate = new Date(this.currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            this.render(newDate);
        });
    }
}    