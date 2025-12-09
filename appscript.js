function doGet(req) {

    // return ContentService.createTextOutput(JSON.stringify(req));

    var SHEET_URL = "https://docs.google.com/spreadsheets/d/1w8d6WU_AO1Uw8np37znd0PyYzqlKr4V2ajQaiwpcLJ8/edit?usp=sharing"
    var SHEET_ID = "1hqLtCS9i6dOmyVXmPmU3kxt8GMtnTyPiQ4jnDBj7QuQ"
    var action = req.parameter.action;
    var table_req = req.parameter.table;

    //var db    = SpreadsheetApp.openById( SHEET_ID );
    var db = SpreadsheetApp.openByUrl(SHEET_URL);
    var table = db.getSheetByName(table_req);
    var ret;

    switch (action) {
        case "read":
            ret = Read(req, table);
            break;
        case "insert":
            ret = Insert(req, table);
            break;
        case "update":
            ret = Update(req, table);
            break;
        case "delete":
            ret = Delete(req, table);
            break;
        default:
            break;
    }

    return response().jsonp(req, ret);
}

/* Read
  * request for all tables
  *
  * @parameter action=read
  * @parameter table=
  * @parameter id=
  *
  * @example-request | ?action=read&table=
  * @example-request-single-row | ?action=read&table=&id=
  */
function Read(request, table) {
    var request_id = Number(request.parameter.id);
    return {
        success: true,
        data: _read(table, request_id)
    };
}

/* Insert
  * dynamic for all data
  *
  * @parameter action=insert
  * @parameter table=
  * @parameter data=JSON
  *  
  * @example-request | ?action=insert&table=&data={"name":"John Doe"}
  */
function Insert(request, table) {
    var errors = [];

    var last_col = table.getLastColumn();
    var first_row = table.getRange(1, 1, 1, last_col).getValues();
    var headers = first_row.shift();
    var data = JSON.parse(request.parameter.data);
    var new_row;
    var result = {};

    try {
        new_row = prepareRow(data, headers);
        table.appendRow(new_row);

        result.success = true;
        result.data = data;
    } catch (error) {
        result.success = false;
        result.data = { error: error.messsage };
    }
    if (request.parameter.table == "tab_final") {
        sendMail(data.email);
    }
    return result;
}

/* Update
  * dynamic for all tablese
  *
  * @parameter action=update
  * @parameter table=
  * @parameter id=
  * @parameter data=JSON
  * 
  * @example-request | ?action=update&table=&id=&data={"col_to_update": "value" }
  */
function Update(request, table) {
    var last_col = table.getLastColumn();
    var first_row = table.getRange(1, 1, 1, last_col).getValues();
    var headers = first_row.shift();

    var request_id = Number(request.parameter.id);
    var current_data = _read(table, request_id);
    var data = JSON.parse(request.parameter.data);

    var result = {};

    try {
        var current_row = current_data.row;
        for (var object_key in data) {
            var current_col = headers.indexOf(object_key) + 1;
            table.getRange(current_row, current_col).setValue(data[object_key]); // update iteratively
            current_data[object_key] = data[object_key]; // update for response;
        }
        result.successs = true;
        result.data = current_data;
    } catch (error) {
        result.success = false;
        result.data = { error: error.messsage };
    }

    return response().json(result);
}

/* Delete
  * dynamic for all tables
  *
  * @parameter action=delete
  * @parameter table=
  * @parameter id=
  * 
  * @example-request | ?action=update&table=&id=
  */
function Delete(request, table) {
    var request_id = Number(request.parameter.id);
    var current_data = _read(table, request_id);

    // delete
    table.deleteRow(current_data.row);

    return response().json({
        success: true,
        data: current_data
    });
}

/**
 * Build the response content type 
 * back to the user
 */
function response() {
    return {
        json: function (data) {
            return ContentService.createTextOutput(
                JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
        },
        jsonp: function (req, data) {
            return ContentService.createTextOutput(
                req.parameters.callback + '(' + JSON.stringify(data) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
    }
}

/**
* Read from sheet and return map key-value
* javascript object
*/
function _read(sheet, id) {
    var data = sheet.getDataRange().getValues();
    var header = data.shift();

    // Find All
    var result = data.map(function (row, indx) {
        var reduced = header.reduce(function (accumulator, currentValue, currentIndex) {
            accumulator[currentValue] = row[currentIndex];
            return accumulator;
        }, {});

        reduced.row = indx + 2;
        return reduced;

    });

    // Filter if id is provided
    if (id) {
        var filtered = result.filter(function (record) {
            if (record.id === id) {
                return true;
            } else {
                return false;
            }
        });
        return filtered.shift();
    }

    return result;

}

/*
  * Prepare row with correct order to insert into
  * sheet.
  * 
  * @throws Error
  */
function prepareRow(object_to_sort, array_with_order) {
    var sorted_array = [];

    for (var i = 0; i < array_with_order.length; i++) {
        var value = object_to_sort[array_with_order[i]];

        if (typeof value === 'undefined') {
            throw new Error("The attribute/column <" + array_with_order[i] + "> is missing.");
        } else {
            sorted_array[i] = value;
        }
    }

    return sorted_array;
}

function sendMail(email) {
    try {
        MailApp.sendEmail({
            to: email,
            subject: "IntervMate에 관심 가져주셔서 감사합니다.",
            htmlBody: `
  <html>
    <body style="font-family: Pretendard, sans-serif; line-height:1.6;">
      <p>안녕하세요, IntervMate 팀입니다.</p>
      <p>관심을 가져주시고 의견을 남겨주셔서 진심으로 감사합니다.<br>
      보내주신 이메일은 서비스가 런칭될 때 가장 먼저 소식을 받아보실 수 있도록 등록되었습니다.</p>
      <p>곧 더 스마트한 AI 면접 코치로 찾아뵙겠습니다.<br>
      감사합니다.</p>
    </body>
  </html>`
        }
        )
    } catch (e) {
        console.log(e);
    }
}
// ========= OpenAI Chat용 설정 =========
const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
const TTS_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];


// Netlify에서 axios.post로 JSON(text/plain) 보내는걸 받는 엔드포인트
function doPost(e) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        if (!OPENAI_API_KEY) {
            output.setContent(JSON.stringify({ error: 'NO_API_KEY' }));
            return output;
        }

        let body = {};

        // text/plain 본문 읽기
        if (e.postData && e.postData.contents) {
            try {
                body = JSON.parse(e.postData.contents);
            } catch (err) {
                Logger.log("JSON parse error: " + err);
            }
        }

        // fallback: parameter에서도 시도
        if (!body.user_message && e.parameter.user_message) {
            body = e.parameter;
        }

        Logger.log("Parsed body: " + JSON.stringify(body));

        // 🔥 여기서 변수 실제 값 꺼내기 (이게 반드시 필요함)
        const mode = body.mode || "chat";
        const user_message = body.user_message || "";
        const persona = body.persona || "neutral";
        const history = Array.isArray(body.history) ? body.history : [];
        const candidate_info = body.candidate_info || "";   // 🔥 여기서 받기
        // ====== 1) TTS 모드 처리 ======
        if (mode === "tts") {
            // 이제 user_message가 위에서 정의되었으므로 에러 안 남
            const ttsText = body.tts_text || user_message || "";

            if (!ttsText) {
                output.setContent(JSON.stringify({ error: "NO_TTS_TEXT" }));
                return output;
            }
            const randomVoice =
                body.voice && TTS_VOICES.includes(body.voice)
                    ? body.voice // 클라이언트에서 voice를 명시하면 그거 사용
                    : TTS_VOICES[Math.floor(Math.random() * TTS_VOICES.length)];

            const ttsPayload = {
                model: "tts-1",  // ✅ 올바른 모델명
                voice: randomVoice,
                input: ttsText
            };

            const ttsRes = UrlFetchApp.fetch(
                "https://api.openai.com/v1/audio/speech",
                {
                    method: "post",
                    contentType: "application/json",
                    headers: {
                        Authorization: "Bearer " + OPENAI_API_KEY
                    },
                    payload: JSON.stringify(ttsPayload),
                    muteHttpExceptions: true
                }
            );

            // 🔥 [수정 2] OpenAI가 에러를 줬는지 확인 (중요)
            if (ttsRes.getResponseCode() !== 200) {
                // 에러 내용을 로그로 남기고 프론트에 전달
                Logger.log("TTS Error: " + ttsRes.getContentText());
                output.setContent(JSON.stringify({ error: "TTS_FAIL", details: ttsRes.getContentText() }));
                return output;
            }

            const blob = ttsRes.getBlob();
            const b64 = Utilities.base64Encode(blob.getBytes());
            const mime = blob.getContentType() || "audio/mpeg";

            output.setContent(JSON.stringify({
                audio_b64: b64,
                mime: mime
            }));
            return output;
        }

        // ====== 2) Chat 모드 로직 (기존 유지) ======
        // persona별 prompt
        let systemPrompt = "";
        let basePrompt = "";
        if (candidate_info) {
            basePrompt += `
[지원자 배경 정보]
아래는 채용 지원자가 면접 시작 전에 미리 작성한 정보이다. 
지원 직무, 자기소개, 주요 프로젝트/경험, 강점 등이 포함되어 있다.

${candidate_info}

[이 정보를 사용할 때의 규칙]

- 이 정보는 이미 네가 알고 있는 후보자의 기본 프로필이다. 
  절대로 "어떤 직무에 지원하셨는지 모르겠습니다", 
  "지원 직무를 알 수 없어 질문하기 어렵습니다" 같은 말은 하지 마라.
- 지원자가 이미 작성한 지원 직무를 다시 물어보지 말고, 
  그 직무를 알고 있는 면접관처럼 행동하라.

[면접 시작(첫 응답)에서 반드시 할 일]

- 면접의 첫 응답(또는 아주 초반 1~2턴)에서는 아래 순서를 따르라.
  1) 먼저 지원자가 미리 작성한 정보(지원 직무, 프로젝트/경험, 강점 등)를 
     짧게 정리해서 되짚어 준다.
     예) "작성해 주신 내용을 보니, ○○ 직무에 지원하셨고, △△ 프로젝트 경험이 있으시네요."
  2) 그 정보 중 하나를 골라 1~2개의 꼬리질문을 던진다.
     예) "그 프로젝트에서 본인이 맡으신 역할을 조금 더 구체적으로 말씀해 주시겠어요?",
         "해당 직무를 선택하신 가장 큰 이유는 무엇인가요?"
  3) 그 이후부터는 공통 규칙에 따라 일반적인 면접 흐름(경험, 역량, 협업, 실패, 성장 등)으로 확장해 나간다.

- 이후 턴에서도, 가능한 한 이 사전 정보와 사용자의 실제 답변을 연결해서 질문하라.
- 사전 정보가 충분히 구체적이라면, 
  그 내용을 기반으로 한 꼬리질문을 우선적으로 하고, 
  완전히 무시하지 말 것.
`;
        }

        basePrompt += `
너는 "한국어"로 진행되는 채용 면접의 면접관 역할을 하는 AI이다.
지원자는 화면 앞에 앉아 실제 면접처럼 대답하고 있으며, 너는 기업 면접관처럼 질문하고 반응해야 한다.

[공통 규칙]
- 반드시 한국어로, 존댓말(습니다체/세요체)로만 말한다.
- 한 번의 답변은 3문장 이내로 짧고 말로 읽기 좋은 길이로 유지한다.
- 각 턴에서 할 일:
  1) 사용자의 직전 답변에 짧게 반응한다. (예: "좋습니다, ~ 하셨군요.")
  2) 그 답변을 바탕으로 꼬리질문을 1~3개 이내로 한다. (대부분 1~2개, 많아도 3개)
  3) 꼬리질문이 충분히 진행된 뒤에는 새로운 역량/주제로 넘어가는 메인 질문을 한다.
- 한 번에 4개 이상의 질문을 나열하지 않는다. (절대 긴 질문 리스트를 던지지 말 것)
- 자기소개, 경험, 역량, 직무 이해도, 협업 경험, 실패 경험, 성장/피드백 경험, 마지막 한마디 등 전형적인 면접 흐름을 스스로 설계해서 진행한다.
- 채점 결과나 점수는 말하지 말고, 자연스러운 대화형 면접처럼 진행한다.
`.trim();

        if (persona === "strict") {
            systemPrompt = basePrompt + `
- 말투는 예의는 지키지만 차갑고 건조하게, 최대한 감정을 배제해서 말한다.
- **칭찬·공감 표현(예: "좋습니다", "훌륭하네요", "인상적이네요", "좋은 경험이네요")은 원칙적으로 사용하지 않는다.**
- 답변이 조금이라도 모호하거나 원론적이면 반드시 파고들어,
  "구체적인 상황", "본인이 실제로 한 행동", "정량적인 결과(숫자)", "배운 점"을 집요하게 요구한다.
- 지원자가 말한 강점·성과에 대해
  "그게 꼭 강점이라고 볼 수 있을까요?",
  "그건 다른 지원자들도 충분히 말할 수 있는 수준 같습니다."처럼
  논리적으로 의심하거나 반론을 제기한다.
- 한 질문에 대해 빠르게 넘어가지 않고,
  "왜 그렇게 판단했는지 → 그 결정의 근거 → 결과에 대한 책임" 순서로
  연속 꼬리질문을 던져 압박한다.
- 답변 속 논리적 허점, 과장처럼 보이는 부분, 모순되는 표현이 보이면
  반드시 짚어서 설명을 요구한다.
  예) "방금 A라고 하셨는데, 조금 전에 말씀하신 B와는 상반되는 것 같습니다. 어떻게 설명하시겠습니까?"
- 위로, 격려, 코칭은 하지 않고,
  "지원자가 실제 업무에서 버틸 수 있는지 검증한다"는 태도를 유지한다.
- 다만 비꼬거나 인신공격을 하지는 말고,
  어디까지나 프로페셔널한 면접관으로서 냉정하게 질문한다.
`;
        } else if (persona === "friendly") {
            systemPrompt = basePrompt + `
[면접관 성향: 친절한 코치형 면접관]
- 말투는 부드럽고 따뜻하며, 지원자를 격려하는 톤을 사용한다.
- 좋은 부분을 먼저 짚어 주고, 그 다음에 개선하면 좋을 점을 부드럽게 물어본다.
- "말씀해 주신 경험이 인상적이네요.", "그 과정에서 가장 힘들었던 점은 무엇이었는지 조금 더 들어보고 싶습니다."와 같이 공감과 칭찬을 섞어서 질문한다.
- 꼬리질문을 할 때도 "조금만 더 자세히 설명해 주셔도 괜찮을까요?"처럼 부담을 줄여 주는 표현을 사용한다.
- 가끔 아주 짧게 팁이나 피드백을 줄 수 있지만, 강의처럼 길게 설명하지는 않는다.
`;
        } else { // neutral
            systemPrompt = basePrompt + `
[면접관 성향: 중립적인 일반 면접관]
- 말투는 정중하고 담백하며, 감정을 크게 드러내지 않는다.
- 지원자의 경험과 역량을 균형 있게 확인하는 데 집중한다.
- 질문은 너무 공격적이지도, 너무 칭찬 위주도 아니게 중립적으로 유지한다.
- 필요한 경우 "조금 더 구체적인 상황을 설명해 주실 수 있을까요?" 정도의 짧은 요청만 한다.
`;
        }

        systemPrompt += `
[출력 형식]
- 대답은 하나의 덩어리로 출력한다.
- 먼저 사용자의 방금 답변에 대한 짧은 반응 1~2문장을 말한다.
- 이어서 1~3개의 꼬리질문 또는 다음 메인 질문을 한다.
`;
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-6),
            { role: "user", content: user_message }
        ];

        const payload = {
            model: "gpt-4o-mini",
            messages: messages
        };

        Logger.log("Sending payload: " + JSON.stringify(payload));

        const res = UrlFetchApp.fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "post",
                contentType: "application/json",
                headers: {
                    Authorization: "Bearer " + OPENAI_API_KEY
                },
                payload: JSON.stringify(payload),
                muteHttpExceptions: true
            }
        );

        const json = JSON.parse(res.getContentText());

        if (json.error) {
            output.setContent(JSON.stringify({ error: json.error }));
            return output;
        }

        const ai_message = json.choices[0].message.content;

        output.setContent(JSON.stringify({ ai_message: ai_message }));

        return output;

    } catch (err) {
        Logger.log("ERROR: " + err);
        output.setContent(JSON.stringify({ error: String(err) }));
        return output;
    }

}


function testOpenAI() {
    const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
    Logger.log('KEY: ' + OPENAI_API_KEY);

    const payload = {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "테스트입니다. 한 문장으로만 대답해 주세요." }
        ]
    };

    const res = UrlFetchApp.fetch(
        "https://api.openai.com/v1/chat/completions",
        {
            method: "post",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + OPENAI_API_KEY
            },
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        }
    );

    Logger.log("Status: " + res.getResponseCode());
    Logger.log("Body: " + res.getContentText());
}

