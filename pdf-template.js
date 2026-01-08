export const reportHtml = (data) => `
<html>
<head>
<style>
body { font-family: Arial; }
h1 { text-align:center }
table { width:100%; border-collapse:collapse }
td,th { padding:8px; border:1px solid #ddd }
</style>
</head>
<body>
<h1>Rapport Hebdomadaire</h1>
<p>Période : ${data.start} → ${data.end}</p>

<table>
<tr><th>Total commandes</th><td>${data.totalOrders}</td></tr>
<tr><th>Total ventes</th><td>${data.totalSales} FCFA</td></tr>
</table>
</body>
</html>
`;