import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ConversationService {
  create(createConversationDto: CreateConversationDto) {
    return 'This action adds a new conversation';
  }

  findAll() {
    return `This action returns all conversation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }

  async sendToAI(inputText: string) {
    const GEMINI_API_KEY = 'AIzaSyBLp1Lx9WYee8348t2Wf9YUdG0P6v27eHA';
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt =
      'Pretend you are a realtionship guru, you should analyze the conversation and help the couple improve their relationship. You should be spiritual, emotional and precise';

    const res = await model.generateContent(prompt + inputText);

    console.log({ res: res.response.text() });

    return res.response.text();
    // return `ich showed up there - convinced that she is not wanted by the world, and being very angry trying to destroy things and herself Well... This persona is still in there. Yesterday we for the first time made the other Ananos talk to her. Or... well... first brought attention to the matter if any of the other ananos actually showed ever love or appreciation to this specific part of her And that's the cycle - once the mad/angry/crazy Anano is out, this persona is judged by all the other Ananos. So it doesn't than even matter how i or other people.react, the reaction of the 'normal' Ananos is enough To trigger the feeling of 'I'm really not loved' for the little bit crazy part of her\\nsopo: So it means expressing her anger is not , and she is suppressing it in order avoid judgment from other characters ?\\nsorb: Usually yes\\nsopo: But she gets very angry with you lately\\n24-12-26\\nsorb: Hey So you resist the telegram temptation I thought about what you wrote regarding your splits. And was wondering if you splitted these splits up further Let's say authentic desire vs responsibility\\nsopo: Sopo sent an attachment.\\n24-12-27\\nsorb: Would be nice to see this on a real sphere You sent an attachment.\\n24-12-28\\nsopo: Sopo sent an attachment.\\n24-12-30\\nsorb: You sent an attachment. Love Georgian humor:))) Too many wars fought because of that:)) You sent an attachment. Long live the USA. Sadly no fake. [url] the same guy which asked to heal the virus in the heart of the Serbs with military intervention :)) You sent an attachment.\\n24-12-31\\nsopo: Cool\\nsorb: You sent an attachment. You sent an attachment.\\n25-01-02\\nsopo: Sopo sent an attachment.\\nsorb: You sent an attachment.\"}", "env": {"Blob": [Function Blob], "FormData": [Function FormData]}, "headers": [Object], "maxBodyLength": -1, "maxContentLength": -1, "method": "post", "timeout": 0, "transformRequest": [[Function transformRequest]], "transformResponse": [[Function transformResponse]], "transitional": {"clarifyTimeoutError": false, "forcedJSONParsing": true, "silentJSONParsing": true}, "url": "http://localhost:8000/conversation/analyze", "validateStatus": [Function validateStatus], "xsrfCookieName": "XSRF-TOKEN", "xsrfHeaderName": "X-XSRF-TOKEN"}, "data": "teeeeeextxtxtxt", "headers": {"connection": "keep-alive", "content-length": "15", "content-type": "text/html; charset=utf-8", "date": "Sun, 26 Jan 2025 11:44:59 GMT", "etag": "W/\"f-Cuy7QSoobQ9cFwFc3hnSsLNzCQ8\"", "keep-alive": "timeout=5", "x-powered-by": "Express"}, "request": {"DONE": 4, "HEADERS_RECEIVED": 2, "LOADING": 3, "OPENED": 1, "UNSENT": 0, "_aborted": false, "_cachedResponse": undefined, "_hasError": false, "_headers": {"accept": "application/json, text/plain, */*", "content-type": "application/json"}, "_incrementalEvents": false, "_lowerCaseResponseHeaders": {"connection": "keep-alive", "content-length": "15", "content-type": "text/html; charset=utf-8", "date": "Sun, 26 Jan 2025 11:44:59 GMT", "etag": "W/\"f-Cuy7QSoobQ9cFwFc3hnSsLNzCQ8\"", "keep-alive": "timeout=5", "x-powered-by": "Express"}, "_method": "POST", "_perfKey": "network_XMLHttpRequest_http://localhost:8000/conversation/analyze", "_performanceLogger": {"_closed": false, "_extras": [Object], "_pointExtras": [Object], "_points": [Object], "_timespans": [Object]}, "_requestId": null, "_response": "teeeeeextxtxtxt", "_responseType": "", "_sent": true, "_subscriptions": [], "_timedOut": false, "_trackingName": "unknown", "_url": "http://localhost:8000/conversation/analyze", "readyState": 4, "responseHeaders": {"Connection": "keep-alive", "Content-Length": "15", "Content-Type": "text/html; charset=utf-8", "Date": "Sun, 26 Jan 2025 11:44:59 GMT", "Etag": "W/\"f-Cuy7QSoobQ9cFwFc3hnSsLNzCQ8\"", "Keep-Alive": "timeout=5", "X-Powered-By": "Express"}, "responseURL": "http://localhost:8000/conversation/analyze", "status": 201, "timeout": 0, "upload": {}, "withCredentials": true}, "status": 201, "statusText": undefined}`;
  }
}
