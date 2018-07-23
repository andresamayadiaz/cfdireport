/**
 * CFDI REPORT
 * andres.amaya.diaz@gmail.com
 * JULIO 2018
 */
var fs = require("fs");
var path = require("path");
var xml2js = require('xml2js');

const basename = path.basename(module.filename);
let parser = new xml2js.Parser();
let workingFolder = process.argv[2];
let outputFile = process.argv[3];
let logStream = undefined;

if(outputFile != undefined)
{
    logStream = fs.createWriteStream(outputFile, {'flags': 'a'});
}

if(workingFolder === undefined)
{
    workingFolder = __dirname; // if no argument process actual folder
}

// process a cfdi file
function processCFDI(file)
{   
    parser.parseString(fs.readFileSync(file, {encoding: 'UTF-8'}), 
        function (err, result) {
            //console.dir(result);
            //console.log('Done');
            //console.log(result['cfdi:Comprobante']['$'].Version);
            //console.log(result['cfdi:Comprobante']['$'].version);

            //fecha,serie,folio,tipodecomprobante,emisor rfc,receptor rfc,moneda,tipocambio,
            //subtotal,descuento,total,total trasladados,total retenidos

            // 1 TRY V3.2
            if(result['cfdi:Comprobante']['$'].version == '3.2')
            {
                processV32(result);
            } else if (result['cfdi:Comprobante']['$'].Version == '3.3')
            {
                processV33(result);
            } else {
                // version de archivo no encontrada
                //@TODO: not yet implemented
            }

        });
}

// CFDI v3.3
function processV33(cfdi)
{
    let comp = cfdi['cfdi:Comprobante']['$'];
    
    //console.log(cfdi['cfdi:Comprobante']['cfdi:Emisor']);
    //console.log(cfdi['cfdi:Comprobante']['cfdi:Receptor']);
    let emisor = cfdi['cfdi:Comprobante']['cfdi:Emisor'][0]['$'];
    let receptor = cfdi['cfdi:Comprobante']['cfdi:Receptor'][0]['$'];
    let conceptos = cfdi['cfdi:Comprobante']['cfdi:Conceptos'][0]['$'];
    let complemento = cfdi['cfdi:Comprobante']['cfdi:Complemento'][0]['$'];

    let output =  comp.Fecha+","+comp.Serie+","+comp.Folio+","+comp.TipoDeComprobante+","+comp.FormaPago;
    output += ","+emisor.Rfc+","+receptor.Rfc+","+comp.Moneda+","+comp.TipoCambio;
    output += ","+comp.SubTotal+","+comp.Descuento+","+comp.Total+"\r\n";
    
    if(outputFile != undefined)
    {
        logStream.write(output);
    } else 
    {
        console.log(output);
    }
}

// CFDI v3.2
function processV32(cfdi)
{
    let comp = cfdi['cfdi:Comprobante']['$'];
    
    //console.log(cfdi['cfdi:Comprobante']['cfdi:Emisor'][0]['$']);
    //console.log(cfdi['cfdi:Comprobante']['cfdi:Receptor'][0]['$']);
    let emisor = cfdi['cfdi:Comprobante']['cfdi:Emisor'][0]['$'];
    let receptor = cfdi['cfdi:Comprobante']['cfdi:Receptor'][0]['$'];
    let conceptos = cfdi['cfdi:Comprobante']['cfdi:Conceptos'][0]['$'];
    let complemento = cfdi['cfdi:Comprobante']['cfdi:Complemento'][0]['$'];

    let output =  comp.fecha+","+comp.serie+","+comp.folio+","+comp.tipoDeComprobante+","+comp.formaDePago;
    output += ","+emisor.rfc+","+receptor.rfc+","+comp.Moneda+","+comp.TipoCambio;
    output += ","+comp.subTotal+","+comp.descuento+","+comp.total+"\r\n";;
    
    if(outputFile != undefined)
    {
        logStream.write(output);
    } else 
    {
        console.log(output);
    }
}

// start the app
function init()
{
    fs
    .readdirSync(workingFolder)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-4) === ".xml");
    })
    .forEach(function(file) {
        var fullPath = path.join(workingFolder, file);
        //console.log(fullPath);
        processCFDI(fullPath);
  });


  if(outputFile != undefined)
  {
      logStream.end();
  }
}

// @TODO: Not yet implemented
function generatePDF(file)
{
    //var cfdi2pdf = require("cfdi2pdf");
    //cfdi2pdf.createPDFClient(xml);
}

// START THE FUN!!
init();
