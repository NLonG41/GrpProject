# Bộ câu hỏi bảo vệ luận án (phiên bản cập nhật, tránh trùng ý)



Dưới đây là 30 câu hỏi phản biện kèm trả lời mẫu, đã giảm trùng lặp và phân bố theo nhiều mảng khác nhau.



1. **Bạn nêu mục tiêu cốt lõi của dự án trong 1 phút.**  

**Trả lời:** Mục tiêu là số hóa vận hành đào tạo: quản lý môn/lớp/phòng/lịch/yêu cầu và hỗ trợ quyết định nhanh cho trợ lý đào tạo bằng giao diện tập trung, dữ liệu nhất quán, cập nhật gần thời gian thực.



2. **Vì sao bạn chọn kiến trúc tách `core` và `realtime`?**  

**Trả lời:** Vì nghiệp vụ CRUD và nghiệp vụ realtime có tải khác nhau. Tách service giúp scale độc lập, dễ khoanh vùng lỗi, và giữ codebase theo trách nhiệm rõ ràng.



3. **Đánh đổi lớn nhất khi đi theo microservice nhẹ thay vì monolith là gì?**  

**Trả lời:** Đánh đổi là tăng độ phức tạp vận hành: quan sát log phân tán, quản lý cấu hình nhiều service, xử lý lỗi liên service khó hơn monolith.



4. **Bạn giải thích mô hình dữ liệu chính và quan hệ giữa `Subject`, `Class`, `ClassSchedule`, `Enrollment`.**  

**Trả lời:** `Subject` là học phần; `Class` là phiên mở môn theo kỳ; `ClassSchedule` là từng buổi cụ thể theo phòng-thời gian; `Enrollment` là quan hệ sinh viên-lớp. Mô hình này tách rõ chương trình học và triển khai thực tế.



5. **Tại sao thêm môn không tự sinh lớp?**  

**Trả lời:** Vì lớp cần thông tin bổ sung (giảng viên, thời gian, sức chứa). Tự sinh ngầm dễ tạo dữ liệu sai nghiệp vụ. Thiết kế hiện tại ưu tiên minh bạch thao tác.



6. **Bạn xử lý lịch lặp như thế nào để calendar không render thành event kéo dài nhiều ngày?**  

**Trả lời:** Backend sinh nhiều record độc lập, mỗi record là một buổi với `start/end` theo ngày cụ thể và giờ trong ngày; frontend map thẳng từng record thành một event block.



7. **Với lựa chọn T2-T4-T6, hệ thống đảm bảo không sinh T7/CN bằng cơ chế nào?**  

**Trả lời:** Duyệt theo từng ngày trong khoảng lặp, kiểm tra day-of-week theo tập đã chọn, chỉ push candidate nếu trùng tập; vì vậy cuối tuần không được tạo.



8. **Bạn xử lý timezone GMT+7 như thế nào để không lệch giờ?**  

**Trả lời:** Nhập liệu theo local VN, chuẩn hóa lưu UTC ở DB, render convert ngược về VN. Ở recurring mình tách rõ “ngày VN” và “giờ VN” trước khi dựng timestamp.



9. **Nếu vừa có `numberOfSessions` vừa có `repeatEndDate`, rule dừng là gì?**  

**Trả lời:** Dừng theo điều kiện đến trước: đạt số buổi hoặc vượt ngày kết thúc. Rule này tránh sinh dư và vẫn tôn trọng mốc thời gian học kỳ.



10. **Phát hiện xung đột phòng đặt ở đâu và vì sao?**  

**Trả lời:** Check chính ở backend để đảm bảo tính đúng đắn khi có nhiều client đồng thời. Frontend chỉ cảnh báo sớm để tăng UX.



11. **Vì sao cần transaction khi tạo lịch lặp nhiều buổi?**  

**Trả lời:** Để tránh trạng thái nửa chừng. Nếu một record fail thì rollback toàn bộ, dữ liệu không bị “một phần đã tạo, một phần thất bại”.



12. **Bạn phân loại lỗi 400/409/500 trong API như thế nào?**  

**Trả lời:** 400 cho input sai, 409 cho conflict nghiệp vụ (trùng lịch, duplicate), 500 cho lỗi hệ thống không mong muốn. UI hiển thị thân thiện, server log chi tiết.



13. **Nguyên nhân thường gặp của Prisma `P2022` trong dự án là gì?**  

**Trả lời:** Schema drift: Prisma client kỳ vọng cột mới nhưng DB thật chưa migrate tương ứng; hoặc query include/select đụng field DB chưa có.



14. **Khi gặp schema drift, quy trình khắc phục chuẩn của bạn là gì?**  

**Trả lời:** Xác định query fail từ log, giảm select/include để unblock, kiểm tra migration thiếu, đồng bộ schema-db-client, rồi chạy test regression để chống tái phát.



15. **Bạn chọn PostgreSQL + Prisma vì lý do gì?**  

**Trả lời:** PostgreSQL mạnh về quan hệ và transaction; Prisma tăng tốc phát triển nhờ type-safe query, giảm lỗi mapping thủ công.



16. **Bạn đánh giá rủi ro bảo mật lớn nhất ở phiên bản hiện tại là gì?**  

**Trả lời:** Cơ chế trust header `x-user-id` ở một số chỗ còn yếu cho production. Cần chuyển hoàn toàn sang verify token ký số.



17. **Nếu triển khai production, bạn harden auth theo lộ trình nào?**  

**Trả lời:** Bắt buộc JWT/Firebase token verification ở gateway/middleware, bỏ trust header thô, thêm role/permission matrix, rotate secret và audit truy cập.



18. **Bạn xử lý phân quyền vai trò (ADMIN/ASSISTANT/LECTURER/STUDENT) ra sao?**  

**Trả lời:** Mỗi route có middleware phù hợp nghiệp vụ; dữ liệu trả về được giới hạn theo quyền và ngữ cảnh thao tác để giảm lộ dữ liệu không cần thiết.



19. **Một câu về enrollment: bạn đảm bảo tính nhất quán khi thêm sinh viên vào lớp thế nào?**  

**Trả lời:** Validate student/class + điều kiện capacity, kiểm tra duplicate, sau đó tạo enrollment và cập nhật `currentEnrollment` trong cùng transaction.



20. **Bạn chọn polling 30s ở một số màn hình thay vì websocket hoàn toàn, vì sao?**  

**Trả lời:** Polling đủ cho nhu cầu hiện tại, triển khai nhanh và ít rủi ro. Chuyển websocket khi cần realtime tức thời hoặc tải cập nhật dày.



21. **Bạn tối ưu trải nghiệm người dùng cho trang lịch học bằng những điểm nào?**  

**Trả lời:** Form tách rõ giờ/ngày, cảnh báo xung đột trước khi submit, hiển thị block trực quan, modal chi tiết event, thông báo lỗi theo ngôn ngữ nghiệp vụ.



22. **Bạn tổ chức code frontend theo pattern gì để dễ bảo trì?**  

**Trả lời:** Tách `components`/`hooks`/`repository`/`api client`; mỗi lớp trách nhiệm rõ ràng: UI hiển thị, hook quản lý state, repository gọi API.



23. **Tại sao bạn cần test regression script thay vì chỉ test tay?**  

**Trả lời:** Vì regression script tái hiện bug cũ có thể chạy lặp lại, phát hiện tái phát nhanh sau mỗi lần sửa và giúp review khách quan hơn test tay.



24. **Bạn sẽ đưa những test nào vào CI trước tiên?**  

**Trả lời:** API critical path: tạo lớp, tạo lịch lặp, add enrollment, query list chính; thêm lint + type-check để chặn lỗi compile trước khi merge.



25. **Bạn xử lý thông điệp lỗi trên UI như thế nào để người dùng không bị “spam kỹ thuật”?**  

**Trả lời:** Bóc tách message kỹ thuật khỏi message nghiệp vụ: server log giữ stack/code, frontend map sang thông báo dễ hiểu và có hướng xử lý.



26. **Bạn sẽ làm gì để tăng khả năng quan sát hệ thống (observability)?**  

**Trả lời:** Thêm request-id xuyên service, structured logging, metrics API latency/error rate, dashboard theo module, alert theo ngưỡng 5xx/P20xx.



27. **Nếu lượng lịch học tăng 10 lần, bạn tối ưu phần nào trước?**  

**Trả lời:** Index theo `startTime/roomId/classId`, phân trang, giảm include nặng, cache query thường dùng, và tối ưu thuật toán generate recurring.



28. **Bạn xử lý dữ liệu seed/migration để tránh lệch môi trường dev-test-prod như thế nào?**  

**Trả lời:** Chuẩn hóa migration pipeline, version hóa seed, áp dụng thứ tự migrate cố định, và có script kiểm tra drift trước deploy.



29. **Bạn đánh giá technical debt lớn nhất hiện tại là gì?**  

**Trả lời:** Chưa chuẩn hóa hoàn toàn auth production, test tự động còn thiếu chiều sâu, và error handling giữa các module chưa đồng nhất 100%.



30. **Nếu có 8 tuần làm lại, bạn giữ và đổi gì?**  

**Trả lời:** Giữ: mô hình dữ liệu tách lớp rõ ràng, kiến trúc core/realtime, UI theo module. Đổi: thiết kế auth chuẩn từ đầu, test regression sớm, và chiến lược migration kỷ luật hơn.



---



## 31. Ví dụ: Có lớp A dùng room A từ 9h–11h, làm sao biết room A đang được sử dụng?

**Trả lời:** Trong dự án này, trạng thái “đang được sử dụng” được xác định bằng cách kiểm tra **time overlap** trong bảng `class_schedule`.



- Về logic nghiệp vụ backend: hệ thống so sánh khoảng thời gian cần kiểm tra với các lịch `ACTIVE` của cùng `roomId` theo điều kiện:

  - `startTime < requestedEnd`

  - `endTime > requestedStart`

- Nếu tồn tại bản ghi thỏa điều kiện trên, kết luận phòng đang bận trong khung giờ đó.



Với ví dụ cụ thể:

- Nếu lớp A đã có lịch ở room A từ **09:00–11:00**,

- Và bạn kiểm tra room A trong khoảng **09:30–10:00** (hoặc tạo lịch chồng lên),

- Hệ thống sẽ trả về conflict (phòng đang được sử dụng).



Bạn có thể kiểm tra qua API availability của phòng (frontend đang dùng) hoặc query SQL trực tiếp:



```sql

SELECT id, "classId", "roomId", "startTime", "endTime", status

FROM class_schedule

WHERE "roomId" = 'room-A'

  AND status = 'ACTIVE'

  AND "startTime" < '2026-03-01 11:00:00+07'

  AND "endTime" > '2026-03-01 09:00:00+07';

```



Nếu query có kết quả, nghĩa là room A đang được sử dụng trong khung giờ kiểm tra.



---



## 32. “Assistant-only endpoints phải qua middleware” nghĩa là gì?
**Trả lời ngắn để bảo vệ:** Đây là lớp chặn quyền ở backend. Các API quản trị (như tạo lịch, tạo môn, duyệt request) bắt buộc đi qua middleware `requireAssistant`. Middleware sẽ kiểm tra role của người gọi trước: đúng quyền thì cho chạy tiếp, sai quyền thì chặn và trả `403 Forbidden`.

Ví dụ thực tế:
- `POST /api/schedules` (tạo lịch)
- `POST /api/subjects` (tạo môn)
- `PUT /api/requests/:id` (duyệt/từ chối yêu cầu)

---

## Gợi ý trả lời khi bị hỏi xoáy

- Theo khung: **Bài toán → Quyết định → Đánh đổi → Giải pháp giảm rủi ro**.

- Nêu 1 bug thật bạn đã sửa để chứng minh năng lực triển khai thực tế.

---

## 33. Tại sao cần cả `type` và `category` trong `class_schedule`?
**Trả lời:** `type` mô tả loại nghiệp vụ chi tiết (`MAIN/MAKEUP/EXAM`), còn `category` dùng để nhóm hiển thị và báo cáo (`STUDY/EXAM`). Nhờ vậy UI và analytics phân biệt lịch học/lịch thi dễ hơn.

## 34. Nếu migration đã có nhưng Neon DB chưa có cột mới thì sao?
**Trả lời:** Đó là lệch môi trường (schema drift). Cách xử lý: chạy migration trên Neon (`npx prisma migrate deploy`), generate lại Prisma client, rồi kiểm tra lại schema bằng query SQL.

## 35. Tại sao check conflict phòng phải làm ở backend?
**Trả lời:** Vì frontend chỉ là client, có thể có nhiều người thao tác đồng thời. Backend là nơi duy nhất đảm bảo tính nhất quán cuối cùng trước khi ghi DB.

## 36. Điều kiện overlap thời gian trong dự án là gì?
**Trả lời:** Hai lịch bị chồng nếu thỏa đồng thời:
- `existing.startTime < newEndTime`
- `existing.endTime > newStartTime`
Điều kiện này bắt đủ các trường hợp giao nhau thực tế.

## 37. Vì sao enrollment dùng transaction?
**Trả lời:** Vì có 2 bước liên quan nhau: tạo `enrollment` và tăng `class.currentEnrollment`. Nếu một bước fail mà bước kia thành công sẽ gây lệch sĩ số, nên cần transaction để atomic.

## 38. Làm sao hệ thống tránh ghi danh trùng sinh viên cùng lớp?
**Trả lời:** Backend kiểm tra bản ghi tồn tại theo cặp `studentId + classId` trước khi tạo, đồng thời DB có unique constraint để chặn ở tầng dữ liệu.

## 39. Khi nào API trả 409 thay vì 400?
**Trả lời:** `400` dùng cho input sai format/schema; `409` dùng cho xung đột nghiệp vụ hợp lệ về format nhưng không thể thực hiện (class full, trùng lịch, duplicate enrollment).

## 40. Role `ASSISTANT` khác `ADMIN` ở dự án này thế nào?
**Trả lời:** `ASSISTANT` chủ yếu vận hành học vụ (subjects/classes/schedules/requests). `ADMIN` thiên về quản trị tài khoản/hệ thống. Một số middleware hiện đang nới lỏng trong dev, nhưng production cần tách quyền chặt hơn.

## 41. Vì sao dùng Neon PostgreSQL thay vì DB local truyền thống?
**Trả lời:** Neon hỗ trợ serverless, SSL, dễ triển khai, giảm gánh nặng vận hành hạ tầng và phù hợp demo/deploy đồ án nhanh.

## 42. Nếu giảng viên không tồn tại mà vẫn tạo class thì sao?
**Trả lời:** Backend chặn ngay ở bước validate nghiệp vụ: kiểm tra lecturer tồn tại và đúng role `LECTURER`, nếu sai trả lỗi 404/400.

## 43. Bạn đảm bảo “lịch thi” hiển thị khác “lịch học” bằng cách nào?
**Trả lời:** Dùng trường `category` (`STUDY/EXAM`) kết hợp `type` để map màu/label trên UI calendar và modal chi tiết.

## 44. Tại sao frontend tách `components/hooks/repository/api`?
**Trả lời:** Để phân tách trách nhiệm:
- `components`: UI
- `hooks`: state + lifecycle
- `repository`: nghiệp vụ gọi API
- `api client`: HTTP thuần
Cách này giảm coupling, dễ test và refactor.

## 45. Vì sao có cả Core service và Realtime service?
**Trả lời:** Core xử lý CRUD + business rules; Realtime xử lý notification/live updates. Tách service giúp scale độc lập và giảm ảnh hưởng chéo khi một phía tăng tải.

## 46. Một bug thực tế bạn có thể nêu khi bảo vệ là gì?
**Trả lời:** Bug phê duyệt request không cập nhật đúng trạng thái UI. Cách xử lý: kiểm tra luồng từ button -> hook -> repository -> api client -> backend, xác thực payload `status`, rồi cập nhật state cục bộ sau khi API thành công.

## 47. Nếu cần kiểm tra nhanh request flow đang chạy đúng, bạn test gì đầu tiên?
**Trả lời:**
1. Gọi `GET /api/requests` xem dữ liệu vào đúng.
2. Gọi `PUT /api/requests/:id` với `APPROVED/REJECTED`.
3. Reload list và đối chiếu trạng thái + adminNote.
4. Kiểm tra log middleware quyền `requireAssistant`.

## 48. Tại sao dashboard analytics nên có fallback an toàn?
**Trả lời:** Vì dashboard thường tổng hợp nhiều truy vấn. Nếu một phần lỗi mà fail toàn bộ sẽ làm UX kém. Fallback giúp vẫn hiển thị phần dữ liệu còn lại và khoanh vùng lỗi nhanh.

## 49. Điểm yếu bảo mật lớn nhất hiện tại và cách khắc phục?
**Trả lời:** Điểm yếu là còn phụ thuộc `x-user-id` ở vài luồng dev. Khắc phục: bắt buộc verify Firebase/JWT token cho toàn bộ route nhạy cảm và chuẩn hóa RBAC.

## 50. Nếu hội đồng hỏi “dự án đã sẵn sàng production chưa?”, trả lời sao?
**Trả lời:** Chưa 100% production-ready. Nền tảng nghiệp vụ và dữ liệu đã ổn, nhưng cần hoàn thiện bảo mật chuẩn token, mở rộng test tự động và observability trước khi triển khai lớn.

- Khi chưa chắc số liệu, trả lời theo nguyên tắc và nói rõ cách bạn sẽ đo/kiểm chứng.