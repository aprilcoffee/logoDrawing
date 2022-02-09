const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());
app.use('/', express.static(__dirname + '/client'));
app.use('/data', express.static(__dirname + '/sketchData'));

function save (content) {
	fs.writeFileSync(`sketchData/${Date.now()}.json`, JSON.stringify(content, null, 2));
}

app.get('/sketches', (req, res) => {
	const sketches = fs.readdirSync(__dirname + '/sketchData').filter((f) => f.endsWith('.json'))
	res.send(sketches)
});

app.post('/sketch', (req, res) => {
	console.log(req.body);
	save(req.body);
  res.send({
		status: 'ok'
	});
});

app.listen(10001, () => {
  console.log(`Example app listening on port 10001`)
});
