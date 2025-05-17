document.addEventListener('alpine:init', () => {
    Alpine.data('weightApp', () => ({
        weightRecords: [],
        currentWeight: 70.0,
        editingWeight: 70.0,
        editingRecordIndex: null,
        editingDate: null,
        originalDate: null,
        selectedDate: new Date(),
        showAddModal: false,
        showEditModal: false,
        showSettingsModal: false,
        isToday: true,
        isYesterday: false,
        isDayBeforeYesterday: false,
        isEditToday: false,
        isEditYesterday: false,
        isEditOriginal: true,
        totalWeightLoss: 0,
        weightChart: null,
        settings: {
            unit: 'kg',
            chartDays: '14'
        },

        init() {
            this.loadRecords();
            this.loadSettings();
            this.calculateWeightLoss();
            this.initChart();
            this.setupHammer();
            
            // 设置初始体重为最近一次记录或默认值
            if (this.weightRecords.length > 0) {
                this.currentWeight = parseFloat(this.weightRecords[0].weight);
            }
        },

        loadRecords() {
            const savedRecords = localStorage.getItem('weightRecords');
            if (savedRecords) {
                this.weightRecords = JSON.parse(savedRecords);
                // 确保日期是Date对象
                this.weightRecords.forEach(record => {
                    record.date = new Date(record.date);
                });
                // 按日期降序排序
                this.sortRecordsByDate();
            }
        },

        loadSettings() {
            const savedSettings = localStorage.getItem('weightSettings');
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
            }
        },

        saveSettings() {
            localStorage.setItem('weightSettings', JSON.stringify(this.settings));
            this.updateChart();
            this.updateDisplayedWeights();
            this.closeSettings();
        },

        // 更新显示的体重值，根据单位设置转换
        updateDisplayedWeights() {
            // 重新渲染所有体重记录，以应用新的单位设置
            this.$nextTick(() => {
                this.calculateWeightLoss();
            });
        },
        
        // 转换重量单位 (kg <-> jin)
        convertWeight(weight, toUnit) {
            const numWeight = parseFloat(weight);
            if (toUnit === 'jin') {
                return (numWeight * 2).toFixed(1); // 1kg = 2斤
            } else {
                return numWeight.toFixed(1); // 默认返回kg值
            }
        },
        
        // 获取显示的体重值（根据当前单位设置）
        getDisplayWeight(weight) {
            return this.convertWeight(weight, this.settings.unit);
        },

        saveRecords() {
            localStorage.setItem('weightRecords', JSON.stringify(this.weightRecords));
        },

        calculateWeightLoss() {
            if (this.weightRecords.length < 2) {
                this.totalWeightLoss = 0;
                return;
            }

            // 获取最早和最近的记录
            const sortedRecords = [...this.weightRecords].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            
            const firstWeight = parseFloat(sortedRecords[0].weight);
            const lastWeight = parseFloat(sortedRecords[sortedRecords.length - 1].weight);
            
            // 计算减重量（如果是增重则显示为负数）
            this.totalWeightLoss = (firstWeight - lastWeight).toFixed(1);
        },

        initChart() {
            const ctx = document.getElementById('weightChart').getContext('2d');
            
            // 准备图表数据
            const chartData = this.prepareChartData();
            
            this.weightChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: this.settings.unit === 'kg' ? '体重 (kg)' : '体重 (斤)',
                        data: this.settings.unit === 'kg' ? chartData.data : chartData.data.map(w => parseFloat(w) * 2),
                        borderColor: '#0080ff',
                        backgroundColor: 'rgba(0, 128, 255, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#0080ff',
                        pointRadius: 4,
                        tension: 0.2,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: (context) => {
                                    const unit = this.settings.unit === 'kg' ? 'kg' : '斤';
                                    return `${context.parsed.y} ${unit}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                maxRotation: 0,
                                font: {
                                    size: 10
                                }
                            }
                        },
                        y: {
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
        },

        prepareChartData() {
            // 按日期排序（升序）
            const sortedRecords = [...this.weightRecords].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            
            // 获取最近N天的记录
            const daysToShow = parseInt(this.settings.chartDays);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
            
            const recentRecords = sortedRecords.filter(record => 
                new Date(record.date) >= cutoffDate
            );
            
            // 准备图表数据
            const labels = recentRecords.map(record => 
                `${new Date(record.date).getMonth() + 1}月${new Date(record.date).getDate()}日`
            );
            
            const data = recentRecords.map(record => parseFloat(record.weight));
            
            return { labels, data };
        },

        updateChart() {
            if (this.weightChart) {
                const chartData = this.prepareChartData();
                
                this.weightChart.data.labels = chartData.labels;
                this.weightChart.data.datasets[0].data = chartData.data;
                
                this.weightChart.update();
            }
        },

        setupHammer() {
            const mainElement = document.querySelector('main');
            const hammer = new Hammer(mainElement);
            
            hammer.on('swipeleft', () => {
                // 向左滑动可以实现的功能，例如切换到统计视图
            });
            
            hammer.on('swiperight', () => {
                // 向右滑动可以实现的功能，例如切换到日历视图
            });
        },

        openAddModal() {
            this.showAddModal = true;
            this.selectedDate = new Date();
            this.isToday = true;
            this.isYesterday = false;
            this.isDayBeforeYesterday = false;
            
            // 设置当前体重为最近一次记录或默认值
            if (this.weightRecords.length > 0) {
                this.currentWeight = parseFloat(this.weightRecords[0].weight);
            } else {
                this.currentWeight = 70.0;
            }
        },

        closeAddModal() {
            this.showAddModal = false;
        },

        increaseWeight() {
            this.currentWeight = (parseFloat(this.currentWeight) + 0.1).toFixed(1);
        },

        decreaseWeight() {
            this.currentWeight = (parseFloat(this.currentWeight) - 0.1).toFixed(1);
        },

        setDateToday() {
            this.selectedDate = new Date();
            this.isToday = true;
            this.isYesterday = false;
            this.isDayBeforeYesterday = false;
        },

        setDateYesterday() {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this.selectedDate = yesterday;
            this.isToday = false;
            this.isYesterday = true;
            this.isDayBeforeYesterday = false;
        },

        setDateDayBeforeYesterday() {
            const dayBeforeYesterday = new Date();
            dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
            this.selectedDate = dayBeforeYesterday;
            this.isToday = false;
            this.isYesterday = false;
            this.isDayBeforeYesterday = true;
        },

        openDatePicker() {
            // 在移动端实现日期选择器
            const datePicker = document.createElement('input');
            datePicker.type = 'date';
            datePicker.style.position = 'absolute';
            datePicker.style.visibility = 'hidden';
            document.body.appendChild(datePicker);
            
            datePicker.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.selectedDate = new Date(e.target.value);
                    this.isToday = false;
                    this.isYesterday = false;
                    this.isDayBeforeYesterday = false;
                }
                document.body.removeChild(datePicker);
            });
            
            datePicker.click();
        },

        saveRecord() {
            // 创建新记录
            const newRecord = {
                weight: parseFloat(this.currentWeight).toFixed(1),
                date: this.selectedDate
            };
            
            // 检查是否已存在同一天的记录
            const existingIndex = this.weightRecords.findIndex(record => 
                this.isSameDay(new Date(record.date), this.selectedDate)
            );
            
            if (existingIndex !== -1) {
                // 更新现有记录
                this.weightRecords[existingIndex] = newRecord;
            } else {
                // 添加新记录
                this.weightRecords.push(newRecord);
            }
            
            // 按日期排序
            this.sortRecordsByDate();
            
            // 保存到本地存储
            this.saveRecords();
            
            // 更新图表和减重计算
            this.updateChart();
            this.calculateWeightLoss();
            
            // 关闭模态框
            this.closeAddModal();
            
            // 添加动画效果，突出显示新记录
            setTimeout(() => {
                const firstRecord = document.querySelector('.weight-record');
                if (firstRecord) {
                    firstRecord.classList.add('highlight-record');
                    setTimeout(() => {
                        firstRecord.classList.remove('highlight-record');
                    }, 1500);
                }
            }, 100);
        },

        sortRecordsByDate() {
            this.weightRecords.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        },

        isSameDay(date1, date2) {
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
        },

        editRecord(record) {
            this.showEditModal = true;
            this.editingWeight = parseFloat(record.weight);
            this.editingDate = new Date(record.date);
            this.originalDate = new Date(record.date);
            
            // 查找记录索引
            this.editingRecordIndex = this.weightRecords.findIndex(r => 
                this.isSameDay(new Date(r.date), this.editingDate)
            );
            
            // 设置日期按钮状态
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            this.isEditToday = this.isSameDay(this.editingDate, today);
            this.isEditYesterday = this.isSameDay(this.editingDate, yesterday);
            this.isEditOriginal = true;
        },

        closeEditModal() {
            this.showEditModal = false;
            this.editingRecordIndex = null;
        },

        increaseEditingWeight() {
            this.editingWeight = (parseFloat(this.editingWeight) + 0.1).toFixed(1);
        },

        decreaseEditingWeight() {
            this.editingWeight = (parseFloat(this.editingWeight) - 0.1).toFixed(1);
        },

        setEditDateToday() {
            this.editingDate = new Date();
            this.isEditToday = true;
            this.isEditYesterday = false;
            this.isEditOriginal = false;
        },

        setEditDateYesterday() {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this.editingDate = yesterday;
            this.isEditToday = false;
            this.isEditYesterday = true;
            this.isEditOriginal = false;
        },

        setEditDateOriginal() {
            this.editingDate = new Date(this.originalDate);
            this.isEditToday = false;
            this.isEditYesterday = false;
            this.isEditOriginal = true;
        },

        openEditDatePicker() {
            // 在移动端实现日期选择器
            const datePicker = document.createElement('input');
            datePicker.type = 'date';
            datePicker.style.position = 'absolute';
            datePicker.style.visibility = 'hidden';
            document.body.appendChild(datePicker);
            
            datePicker.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.editingDate = new Date(e.target.value);
                    this.isEditToday = false;
                    this.isEditYesterday = false;
                    this.isEditOriginal = false;
                }
                document.body.removeChild(datePicker);
            });
            
            datePicker.click();
        },

        updateRecord() {
            if (this.editingRecordIndex === null) return;
            
            // 先删除原记录
            this.weightRecords.splice(this.editingRecordIndex, 1);
            
            // 检查新日期是否已有记录
            const existingIndex = this.weightRecords.findIndex(record => 
                this.isSameDay(new Date(record.date), this.editingDate)
            );
            
            if (existingIndex !== -1) {
                // 更新现有记录
                this.weightRecords[existingIndex].weight = parseFloat(this.editingWeight).toFixed(1);
            } else {
                // 添加新记录
                this.weightRecords.push({
                    weight: parseFloat(this.editingWeight).toFixed(1),
                    date: this.editingDate
                });
            }
            
            // 按日期排序
            this.sortRecordsByDate();
            
            // 保存到本地存储
            this.saveRecords();
            
            // 更新图表和减重计算
            this.updateChart();
            this.calculateWeightLoss();
            
            // 关闭模态框
            this.closeEditModal();
        },

        deleteRecord() {
            if (this.editingRecordIndex === null) return;
            
            // 删除记录
            this.weightRecords.splice(this.editingRecordIndex, 1);
            
            // 保存到本地存储
            this.saveRecords();
            
            // 更新图表和减重计算
            this.updateChart();
            this.calculateWeightLoss();
            
            // 关闭模态框
            this.closeEditModal();
        },

        openSettings() {
            this.showSettingsModal = true;
        },

        closeSettings() {
            this.showSettingsModal = false;
        }
    }));
});

// 已移除Service Worker注册代码（为APK打包准备）
