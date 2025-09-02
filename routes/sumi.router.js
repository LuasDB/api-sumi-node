import express from 'express';
import Sumi from '../services/sumi.service.js'
import upload from '../configurations/multer-config.js';
const router = express.Router()
const sumi = new Sumi()


const sumiRouter = (io)=>{

  router.post('/quote', async(req, res,next)=>{
    try {
      console.log('Reciviendo', req.body)
      const newQuote = await sumi.sendQuote(req.body)

      res.status(200).json({
        success:true,
        message:'Solicitud enviada con éxito. Te enviamos un correo',
        data:newQuote

      })
    } catch (error) {
      next(error)
    }
  })

  router.get('/', async(req, res,next)=>{
    try {
      const accreditations = await sumi.getAccreditations()


      res.status(200).json({
        success:true,
        message:'Solicitud enviada con éxito. Te enviamos un correo',
        data:accreditations

      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/create',upload('accreditations').fields([
    { name: 'acreditacion', maxCount: 1 },
    { name: 'cmc', maxCount: 1 }
  ]), async(req, res,next)=>{
    try {

      const newAccreditation = await sumi.createAccreditation(req.body,req.files)

      res.status(200).json({
        success:true,
        message:'Registro creado con éxito',
        data:newAccreditation

      })
    } catch (error) {
      next(error)
    }
  })

  router.patch('/:id',upload("accreditations").fields([
    { name: "acreditacion", maxCount: 1 },
    { name: "cmc", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const updatedAccreditation = await sumi.updateAccreditation(
        id,
        req.body,
        req.files
      );

      res.status(200).json({
        success: true,
        message: "Registro actualizado con éxito",
        data: updatedAccreditation,
      });
    } catch (error) {
      next(error);
    }
  }
  );

  router.delete('/:id',async (req, res, next) => {
    try {

      const deleteAccreditation = await sumi.deleteAccreditation(req.params.id);

      res.status(200).json({
        success: true,
        message: "Registro eliminado con éxito",
        data: deleteAccreditation,
      });
    } catch (error) {
      next(error);
    }
  }
  );

  return router
}

export default sumiRouter
