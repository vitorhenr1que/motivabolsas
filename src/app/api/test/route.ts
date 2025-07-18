import { listImageObjectIds } from "../../services/googleApisAuth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {

    try{
      const response = await listImageObjectIds("1BWGjxinMQS3CJIVGml3JI25CiFVxTcsCg7bKALDNBI4")
      return Response.json(response, {status: 200})
    }catch(e){
        return Response.json(e, {status: 400})
    }
}