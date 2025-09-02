import Boom from "@hapi/boom"
import path from "path"
import { sendMail } from "../utils/sendMail.js"
import { db } from "../db/mongoClient.js"
import config from "../config.js"
import { ObjectId } from "mongodb"
import fs from 'fs'


class Sumi{
  constructor(){

  }

  async sendQuote(data){
    console.log(data)
    try {
      await sendMail({
        from:config.emailSupport,
        to:data.email,
        subject:'Cotización de calibración SUMI',
        data:{name:data.name},
        templateEmail:'notifyClient',
        attachments:[{
          filename:'logo',
          path:path.join(`emails/logo.png`),
          cid:'logo'
        }]
      })

       await sendMail({
        from:config.emailSupport,
        to:'saul.delafuente@samar-technologies.com',
        subject:'Cotización de calibración SUMI',
        data:{name:data.name, email:data.email, phone:data.phone, company:data.company,message:data.details},
        templateEmail:'notifyLab',
        attachments:[{
          filename:'logo',
          path:path.join(`emails/logo.png`),
          cid:'logo'
        }]
      })


      return true
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error al ENVIAR NOTIFICACIÓN',error)
    }
  }

  async getAccreditations(){
    try {
      const accreditations = await db.collection('accreditations').find().toArray()
      if(!accreditations || accreditations.length === 0){
        throw Boom.notFound('No se encontraron acreditaciones')
      }
      return accreditations
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error al obtener acreditaciones', error)
    }
  }

  async createAccreditation(data,files){
    try {
      if(!files){
        throw Boom.badRequest('No se ha enviado un archivo')
      }
      if(!data){
        throw Boom.badRequest('No se han enviado datos')
      }
      const result = await db.collection('accreditations').insertOne({
        ...data,
        fileAcreditation: files['acreditacion'] ? files['acreditacion'][0].path : null,
        fileCmc: files['cmc'] ? files['cmc'][0].path : null,
        createdAt:new Date(),
        updatedAt:new Date()
      })
      // if(!result.acknowledged){
      //   throw Boom.badImplementation('Error al crear acreditación')
      // }

      return { status: 'created', data, files,result}
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error al crear acreditación', error)
    }
  }

  async updateAccreditation(id, data, files) {
  try {
    if (!id) {
      throw Boom.badRequest("ID es requerido para actualizar");
    }

    const updateDoc = {
      ...data,
      updatedAt: new Date(),
    };


    if (files?.acreditacion) {
      updateDoc.fileAcreditation = files["acreditacion"][0].path;
    }
    if (files?.cmc) {
      updateDoc.fileCmc = files["cmc"][0].path;
    }

    const result = await db
      .collection("accreditations")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

    if (result.matchedCount === 0) {
      throw Boom.notFound("Acreditación no encontrada");
    }

    return { status: "updated", id, updateDoc, result };
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    throw Boom.badImplementation("Error al actualizar acreditación", error);
  }
  }



async deleteAccreditation(id) {
  try {
    if (!id) {
      throw Boom.badRequest("ID es requerido para eliminar");
    }

    const accreditation = await db
      .collection("accreditations")
      .findOne({ _id: new ObjectId(id) });

    if (!accreditation) {
      throw Boom.notFound("Acreditación no encontrada");
    }

    const result = await db
      .collection("accreditations")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount !== 0) {
      const filesToDelete = [
        accreditation.fileAcreditation,
        accreditation.fileCmc,
      ].filter(Boolean);

      for (const filePath of filesToDelete) {
        const absolutePath = path.resolve(filePath);
        fs.unlink(absolutePath, (err) => {
          if (err) {
            console.error(`❌ Error eliminando archivo: ${absolutePath}`, err);
          } else {
            console.log(`🗑️ Archivo eliminado: ${absolutePath}`);
          }
        });
      }
    }

    return { status: "deleted", id, result };
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    throw Boom.badImplementation("Error al eliminar acreditación", error);
  }
}





}

export default Sumi
