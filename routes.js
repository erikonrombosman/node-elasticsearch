const express = require('express');
//Se instancia el objecto enrutador de express
const router =  express.Router();
//importa el cliente oficial de elasticseach
const elastic = require('elasticsearch');
//permite leer json en POST request
const bodyParser = require('body-parser').json();
//Se crea una instancia del cliente de elasticsearch,
//que se conecta a localhost en el puerto 9200
const elasticClient = elastic.Client({
  host: 'localhost:9200',
});

let productos = [
  {
    "sku": "1",
    "name": "Sillón 3 cuerpos",
    "categories":  ["sillon", "sofa", "muebles", "living", "cuero"],
    "description": "Hermoso sillón de cuero de 3 cuerpos"
  },
  {
    "sku": "2",
    "name": "Sillón 2 cuerpos",
    "categories":  ["sillon", "sofa", "muebles", "living", "ecocuero"],
    "description": "Hermoso sillón de ecocuero de 2 cuerpos"
  },
  {
    "sku": "3",
    "name": "Mesa de comedor redonda de vidrio",
    "categories":  ["mesa", "comedor", "vidrio"],
    "description": "Moderna mesa de 110 cm de radio"
  }
];

router.use((req, res, next)=>{
  elasticClient.index({
    index: 'logs',
    body: {
      url: req.url,
      method: req.method,
    }
  })
  .then(res=>{
    console.log('Logs indexed')
  })
  .catch(err=>{
    console.log(err)
  })
  next();
});

router.post('/products', bodyParser, (req, res)=>{
  elasticClient.index({
    index: 'products',
    body: req.body
  })
  .then(resp=>{
    return res.status(200).json({
      msg: 'product indexed'
    });
  })
  .catch(err=>{
    return res.status(500).json({
      msg: 'Error',
      err
    });
  })
});

router.get('/products/:id', (req, res)=>{
  let query = {
    index: 'products',
    id: req.params.id
  }
  elasticClient.get(query)
  .then(resp=>{
    if(!resp){
      return res.status(404).json({
        product: resp
      });
    }
    return res.status(200).json({
      product: resp
    });
  })
  .catch(err=>{
    return res.status(500).json({
      msg: 'Error not found',
      err
    });
  });
});

router.put('/products/:id', bodyParser, (req, res)=>{
  elasticClient.update({
    index: 'products',
    id: req.params.id,
    body: {
      doc: req.body
    }
  })
  .then(resp=>{
    return res.status(200).json({
      msg: 'product updated'
    });
  })
  .catch(err=>{
    console.log(err)
    return res.status(500).json({
      msg: 'Error',
      err
    });
  })
});

router.delete('/products/:id', (req, res)=>{
  elasticClient.delete({
    index: 'products',
    id: req.params.id
  })
  .then(resp=>{
    res.status(200).json({
      'msg': 'Product deleted'
    });
  })
  .catch(err=>{
    res.status(404).json({
      'msg': 'Error'
    });
  });
});

router.get('/products', (req, res)=>{
  let query = {
    index: 'products'
  }
  if (req.query.product) query.q =  `*${req.query.product}*`;
  elasticClient.search(query)
  .then(resp=>{
    return res.status(200).json({
      products: resp.hits.hits
    });
  })
  .catch(err=>{
    console.log(err);
    return res.status(500).json({
      msg: 'Error',
      err
    });
  });
});

module.exports = router;