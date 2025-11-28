// デバッグ用：ファイルが読み込まれたか確認
console.log("script.js が読み込まれました");

// 計算実行のメイン関数
function calculate() {
    console.log("計算ボタンがクリックされました");

    // 入力値の取得
    const faceValue = parseFloat(document.getElementById('faceValue').value);
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const period = parseInt(document.getElementById('period').value);
    const couponRate = parseFloat(document.getElementById('couponRate').value) / 100; 
    const effectiveRate = parseFloat(document.getElementById('effectiveRate').value) / 100;

    // バリデーション（入力チェック）
    if (isNaN(faceValue) || isNaN(purchasePrice) || isNaN(period)) {
        alert("全ての項目に正しい数値を入力してください。");
        return;
    }

    // --- 定額法の計算と表示 ---
    const slHtml = calcStraightLine(faceValue, purchasePrice, period, couponRate);
    document.getElementById('straightLineResult').innerHTML = slHtml;

    // --- 利息法の計算と表示 ---
    if (!isNaN(effectiveRate)) {
        const eiHtml = calcInterestMethod(faceValue, purchasePrice, period, couponRate, effectiveRate);
        document.getElementById('interestMethodResult').innerHTML = eiHtml;
    } else {
        document.getElementById('interestMethodResult').innerHTML = "<p style='color:red'>利息法を計算するには実効利子率を入力してください。</p>";
    }
}

// 定額法のロジック
function calcStraightLine(face, price, years, cRate) {
    const totalDiff = face - price; // 金利調整差額の総額
    const annualAmortization = totalDiff / years; // 毎期の償却額
    const annualCash = face * cRate; // 現金受取利息

    let currentVal = price;
    let html = `
    <table>
        <thead>
            <tr>
                <th>年度</th>
                <th>現金利息</th>
                <th>償却額</th>
                <th>受取利息総額</th>
                <th>帳簿価額</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>取得時</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>${fmt(price)}</td>
            </tr>`;

    for (let i = 1; i <= years; i++) {
        let amort = annualAmortization;
        
        // 最終年度の端数調整（帳簿価額 = 額面金額 に強制）
        if (i === years) {
            amort = face - currentVal;
        }

        const interestTotal = annualCash + amort;
        currentVal += amort;

        html += `
            <tr>
                <td>${i}年目</td>
                <td>${fmt(annualCash)}</td>
                <td>${fmt(amort)}</td>
                <td>${fmt(interestTotal)}</td>
                <td>${fmt(currentVal)}</td>
            </tr>`;
    }
    html += `</tbody></table>`;
    return html;
}

// 利息法のロジック
function calcInterestMethod(face, price, years, cRate, eRate) {
    let currentVal = price;
    const annualCash = face * cRate; // クーポン利息

    let html = `
    <table>
        <thead>
            <tr>
                <th>年度</th>
                <th>現金利息(A)</th>
                <th>利息法収益(B)</th>
                <th>償却額(B-A)</th>
                <th>帳簿価額</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>取得時</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>${fmt(price)}</td>
            </tr>`;

    for (let i = 1; i <= years; i++) {
        let interestIncome = currentVal * eRate; // 有価証券利息 = 帳簿価額 × 実効利子率
        let amort = interestIncome - annualCash; // 償却額

        // 最終年度の端数調整
        if (i === years) {
            amort = face - currentVal;
            interestIncome = annualCash + amort;
        }

        currentVal += amort;

        html += `
            <tr>
                <td>${i}年目</td>
                <td>${fmt(annualCash)}</td>
                <td>${fmt(interestIncome)}</td>
                <td>${fmt(amort)}</td>
                <td>${fmt(currentVal)}</td>
            </tr>`;
    }
    html += `</tbody></table>`;
    return html;
}

// 数値をカンマ区切りの円形式にする関数
function fmt(num) {
    return Math.round(num).toLocaleString();
}