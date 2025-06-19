// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置输入框默认值
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '0';
    });
    
    // 分析按钮事件
    document.getElementById('analyzeBtn').addEventListener('click', function() {
        showProgress();
    });
    
    // 关闭结果弹窗
    document.getElementById('closeResultBtn').addEventListener('click', function() {
        document.getElementById('resultOverlay').classList.remove('active');
        // 安全销毁图表
        if (window.factorChart && window.factorChart instanceof Chart) {
            window.factorChart.destroy();
            window.factorChart = null; // 清除引用
        }
    });
});

// 显示进度条
function showProgress() {
    const overlay = document.getElementById('progressOverlay');
    const progressBar = document.getElementById('progressBar');
    
    overlay.classList.add('active');
    progressBar.style.width = '0%';
    
    // 随机进度时间（1-5秒）
    const duration = 1000 + Math.random() * 4000;
    let progress = 0;
    const interval = 50;
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
        progress += increment;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        
        if (progress >= 100) {
            clearInterval(timer);
            setTimeout(() => {
                overlay.classList.remove('active');
                analyzeData();
                showResults();
            }, 300);
        }
    }, interval);
}

// 分析数据
function analyzeData() {
    // 获取输入值
    const normalKD = parseFloat(document.getElementById('normalKD').value) || 0;
    const confidentialKD = parseFloat(document.getElementById('confidentialKD').value) || 0;
    const topSecretKD = parseFloat(document.getElementById('topSecretKD').value) || 0;
    const hitRate = parseFloat(document.getElementById('hitRate').value) || 0;
    const profitLoss = parseFloat(document.getElementById('profitLoss').value) || 0;
    const accuracy = parseFloat(document.getElementById('accuracy').value) || 0;
    const overallEvac = parseFloat(document.getElementById('overallEvac').value) || 0;
    const recentEvac = parseFloat(document.getElementById('recentEvac').value) || 0;
    const combat = parseFloat(document.getElementById('combat').value) || 0;
    const wealth = parseFloat(document.getElementById('wealth').value) || 0;
    const search = parseFloat(document.getElementById('search').value) || 0;
    const cooperation = parseFloat(document.getElementById('cooperation').value) || 0;
    const survival = parseFloat(document.getElementById('survival').value) || 0;
    
    // 在结果中显示数据
    document.getElementById('r-normalKD').textContent = normalKD.toFixed(2);
    document.getElementById('r-confidentialKD').textContent = confidentialKD.toFixed(2);
    document.getElementById('r-topSecretKD').textContent = topSecretKD.toFixed(2);
    document.getElementById('r-hitRate').textContent = hitRate.toFixed(2) + '%';
    document.getElementById('r-profitLoss').textContent = profitLoss.toFixed(2) + 'M';
    document.getElementById('r-accuracy').textContent = accuracy.toFixed(2) + '%';
    document.getElementById('r-overallEvac').textContent = overallEvac.toFixed(2) + '%';
    document.getElementById('r-recentEvac').textContent = recentEvac.toFixed(2) + '%';
    
    // 计算综合评分
    const score = calculateScore(
        confidentialKD,
        topSecretKD,
        accuracy,
        profitLoss,
        overallEvac,
        recentEvac,
        combat,
        survival
    );
    
    // 确定匹配池类型
    const matchType = document.getElementById('matchType');
    if (score >= 1.39) {
        matchType.textContent = '黑屋对局';
        matchType.className = 'result-value blackroom';
    } else if (score < 1.00) {
        matchType.textContent = '低强度对局';
        matchType.className = 'result-value low';
    } else {
        matchType.textContent = '正常对局';
        matchType.className = 'result-value normal';
    }
    
    // 计算各个因子值
    const factors = {
        '机密战损比': confidentialKD / 1.4,
        '绝密战损比': topSecretKD / 0.94,
        '精准击败率': accuracy / 47.64,
        '赚损比': profitLoss / 1.16,
        '总体撤离率': overallEvac / 45.1,
        '近期撤离率': recentEvac / 30,
        '战斗能力': combat / 57.5,
        '生存能力': survival / 78.25
    };
    
    // 创建影响因子图表
    createFactorChart(factors, score);
}

// 计算综合评分
function calculateScore(confidential, topSecret, accuracy, profitLoss, overallEvac, recentEvac, combat, survival) {
    return 0.20 * (confidential / 1.4) +
           0.15 * (topSecret / 0.94) +
           0.20 * (accuracy / 47.64) +
           0.10 * (profitLoss / 1.16) +
           0.10 * (overallEvac / 45.1) +
           0.10 * (recentEvac / 30) +
           0.10 * (combat / 57.5) +
           0.05 * (survival / 78.25);
}

// 创建影响因子图表
function createFactorChart(factors, totalScore) {
    const ctx = document.getElementById('factorChart').getContext('2d');
    
    // 安全销毁旧图表
    if (window.factorChart && window.factorChart instanceof Chart) {
        window.factorChart.destroy();
        window.factorChart = null;
    }
    
    const factorNames = Object.keys(factors);
    const factorValues = Object.values(factors);
    
    // 确定哪些因子超过参考值（1.0）
    const backgroundColors = factorValues.map(value => 
        value > 1.0 ? 'rgba(229, 62, 62, 0.7)' : 'rgba(30, 107, 184, 0.7)'
    );
    
    window.factorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: factorNames,
            datasets: [{
                label: '因子值 / 参考值',
                data: factorValues,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '因子值 / 参考值',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '影响因子',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toFixed(2)} (参考值: 1.00)`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        refLine: {
                            type: 'line',
                            yMin: 1.0,
                            yMax: 1.0,
                            borderColor: 'rgba(229, 62, 62, 0.8)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: '参考值',
                                position: 'end',
                                backgroundColor: 'rgba(229, 62, 62, 0.8)',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        totalScoreLine: {
                            type: 'line',
                            yMin: totalScore,
                            yMax: totalScore,
                            borderColor: 'rgba(56, 161, 105, 0.8)',
                            borderWidth: 2,
                            label: {
                                display: true,
                                content: `综合评分: ${totalScore.toFixed(2)}`,
                                position: 'end',
                                backgroundColor: 'rgba(56, 161, 105, 0.8)',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

// 显示结果弹窗
function showResults() {
    document.getElementById('resultOverlay').classList.add('active');
}