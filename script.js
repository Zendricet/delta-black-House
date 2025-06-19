// 获取DOM元素
const analyzeBtn = document.getElementById('analyze-btn');
const progressModal = document.getElementById('progress-modal');
const reportModal = document.getElementById('report-modal');
const progressFill = document.getElementById('progress-fill');
const closeReport = document.getElementById('close-report');
const announcementContent = document.getElementById('announcement-content');

// 输入字段ID列表
const inputFields = [
    'normal-kd', 'confidential-kd', 'top-secret-kd', 
    'extract-rate', 'recent-extract', 'profit-ratio',
    'combat', 'wealth', 'search', 'cooperation', 'survival'
];

// 报告字段ID列表
const reportFields = [
    'report-normal-kd', 'report-confidential-kd', 'report-top-secret-kd', 
    'report-extract-rate', 'report-recent-extract', 'report-profit-ratio',
    'report-combat', 'report-wealth', 'report-search', 'report-cooperation', 'report-survival'
];

// 模拟从文件获取公告内容
function fetchAnnouncement() {
    // 在实际应用中，这里会从服务器获取res/Proclamation.txt文件内容
    // 这里我们模拟文件内容
    const proclamationContent = `
        <p><span class="important">【重要更新】</span> 黑屋分析算法V2.0已上线！本次更新重构全部算法和网页，数据评价更加相对准确。</p>
        <p class="important">提示：据匿名用户反馈组队匹配池与单排匹配池不同，组队匹配池当队伍三名玩家其中任意一位数据发生变化时将存在“待定局”其持续场数无法确定，“待定局”数据过高将会导致匹配结果高压！</p>
        <div class="update-time">更新时间：2025年06月19日</div>
    `;
    
    // 设置公告内容
    announcementContent.innerHTML = proclamationContent;
}

// 页面加载时获取公告
window.addEventListener('DOMContentLoaded', fetchAnnouncement);

// 分析按钮点击事件
analyzeBtn.addEventListener('click', function() {
    // 填充默认值
    fillDefaults();
    
    // 显示进度条模态框
    progressModal.style.display = 'flex';
    
    // 随机进度条时间（1-5秒）
    const duration = 1000 + Math.random() * 4000;
    let progress = 0;
    const interval = 20;
    const increment = (interval / duration) * 100;
    
    const progressInterval = setInterval(() => {
        progress += increment;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            // 关闭进度条，显示报告
            setTimeout(() => {
                progressModal.style.display = 'none';
                generateReport();
                reportModal.style.display = 'flex';
            }, 300);
        }
    }, interval);
});

// 关闭报告
closeReport.addEventListener('click', function() {
    reportModal.style.display = 'none';
});

// 点击模态框外部关闭
window.addEventListener('click', function(event) {
    if (event.target === progressModal) {
        progressModal.style.display = 'none';
    }
    if (event.target === reportModal) {
        reportModal.style.display = 'none';
    }
});

// 填充默认值
function fillDefaults() {
    inputFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (!input.value) {
            input.value = '0';
        }
    });
}

// 生成报告
function generateReport() {
    // 收集输入值
    const values = {};
    inputFields.forEach(fieldId => {
        values[fieldId] = parseFloat(document.getElementById(fieldId).value) || 0;
    });
    
    // 更新报告中的玩家数据
    inputFields.forEach((fieldId, index) => {
        const reportField = document.getElementById(reportFields[index]);
        if (fieldId === 'extract-rate' || fieldId === 'recent-extract') {
            reportField.value = `${values[fieldId]}%`;
        } else if (fieldId === 'profit-ratio') {
            reportField.value = `${values[fieldId]}M`;
        } else {
            reportField.value = values[fieldId];
        }
    });
    
    // 计算量化分数
    const baseValue = calculateBaseValue(values);
    const combatValue = calculateCombatValue(values);
    const quantScore = baseValue + combatValue;
    
    // 确定对局强度
    let matchIntensity, intensityClass;
    if (quantScore < 100) {
        matchIntensity = "低强对局（唐人）";
        intensityClass = "low";
    } else if (quantScore < 130) {
        matchIntensity = "正常对局（一般）";
        intensityClass = "normal";
    } else if (quantScore < 150) {
        matchIntensity = "高压对局（护航）";
        intensityClass = "high";
    } else {
        matchIntensity = "黑屋对局（外挂）";
        intensityClass = "black";
    }
    
    // 更新对局强度显示
    const matchElement = document.getElementById('match-intensity');
    matchElement.textContent = matchIntensity;
    matchElement.className = `result-value ${intensityClass}`;
    
    // 更新坐标系
    updateCoordinateSystem(baseValue, combatValue);
    
    // 更新建议
    updateAdvice(matchIntensity);
}

// 计算基础值
function calculateBaseValue(values) {
    const avgAbility = (
        values['combat'] + 
        values['wealth'] + 
        values['search'] + 
        values['cooperation'] + 
        values['survival']
    ) / 5;
    
    return values['profit-ratio'] * avgAbility;
}

// 计算战斗值
function calculateCombatValue(values) {
    const kdScore = 
        (values['normal-kd'] * 2) + 
        (values['confidential-kd'] * 3) + 
        (values['top-secret-kd'] * 4);
    
    return values['profit-ratio'] * kdScore * (values['recent-extract'] / 100);
}

// 更新坐标系
function updateCoordinateSystem(baseValue, combatValue) {
    const dataPoint = document.getElementById('data-point');
    const chart = document.querySelector('.chart-container');
    const width = chart.clientWidth - 80; // 减去坐标轴偏移
    const height = chart.clientHeight - 60; // 减去坐标轴偏移
    
    // 简单缩放 - 实际应用中需要更复杂的比例计算
    const maxBase = 300;
    const maxCombat = 250;
    
    const xPos = 50 + (baseValue / maxBase) * width;
    const yPos = 30 + (1 - combatValue / maxCombat) * height;
    
    dataPoint.style.left = `${Math.min(xPos, 50 + width)}px`;
    dataPoint.style.top = `${Math.min(yPos, 30 + height)}px`;
}

// 更新建议
function updateAdvice(intensity) {
    const adviceContent = document.getElementById('advice-content');
    let adviceHTML = '';
    
    switch(intensity) {
        case "低强对局":
            adviceHTML = `
                <p>您的游戏行为数据显示为低强度对局模式，建议：</p>
                <ul>
                    <li>继续保持当前游戏风格和节奏</li>
                    <li>适当提升战斗参与度，保持KD在合理区间</li>
                    <li>关注撤离策略，避免过于激进的游戏风格</li>
                    <li>组队时应检查队友数据，避免异常账号影响匹配</li>
                </ul>
                <p>注意：长期低强度游戏可能导致物品爆率状态变化！无法确定该变化是否良好。</p>
            `;
            break;
            
        case "正常对局":
            adviceHTML = `
                <p>您的游戏行为数据处于健康范围，建议：</p>
                <ul>
                    <li>继续保持当前游戏风格和节奏</li>
                    <li>组队应检查队友数据，避免异常账号影响匹配</li>
                    <li>避免连续多局超高收益或超高KD表现</li>
                    <li>保持撤离率的合理区间</li>
                </ul>
                <p>正常对局模式是最稳定的匹配状态，请保持平衡的游戏行为。</p>
            `;
            break;
            
        case "高压对局":
            adviceHTML = `
                <p>您的游戏行为数据接近高压阈值，建议：</p>
                <ul>
                    <li>适当降低战斗强度，避免连续高击杀局</li>
                    <li>分散高收益对局，避免连续多局超高收益</li>
                    <li>检查组队成员是否存在异常账号、标记账号</li>
                    <li>减少瞬杀比例，增加TTK，平衡撤离率</li>
                    <li>考虑暂停游戏时常，重置匹配模式</li>
                </ul>
                <p>高压对局通常是进入黑屋匹配的前兆，请谨慎调整游戏行为。</p>
            `;
            break;
            
        case "黑屋对局":
            adviceHTML = `
                <p>您的游戏行为数据符合黑屋匹配特征，建议：</p>
                <ul>
                    <li>立即停止高强度对局，降低KD表现</li>
                    <li>暂停高收益玩法，减少单局资产获取</li>
                    <li>彻底检查组队成员，排除异常账号</li>
                    <li>增加非战斗比例，降低近期撤离率</li>
                    <li>暂停游戏3-7天降低活跃度（14天最佳），等待匹配重置</li>
                </ul>
                <p class="red-text">警告：持续黑屋匹配可能导致账号被标记或限制，请谨慎游戏。</p>
            `;
            break;
    }
    
    adviceContent.innerHTML = adviceHTML;
}
