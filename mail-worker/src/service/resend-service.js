import emailService from './email-service';
import { emailConst } from '../const/entity-const';
import BizError from '../error/biz-error';

const resendService = {

	async webhooks(c, body) {

		const params = {
			resendEmailId: body.data.email_id,
			status: emailConst.status.SENT
		}

		if (body.type === 'email.delivered') {
			params.status = emailConst.status.DELIVERED
			params.message = null
		}

		if (body.type === 'email.complained') {
			params.status = emailConst.status.COMPLAINED
			params.message = null
		}

		if (body.type === 'email.bounced') {
			let bounce = body.data.bounce
			bounce = JSON.stringify(bounce);
			params.status = emailConst.status.BOUNCED
			params.message = bounce
		}

		if (body.type === 'email.delivery_delayed') {
			params.status = emailConst.status.DELAYED
			params.message = null
		}

		if (body.type === 'email.failed') {
			params.status = emailConst.status.FAILED
			params.message = body.data.failed.reason
		}

		const emailRow = await emailService.updateEmailStatus(c, params)

		if (!emailRow) {
			// This Resend account is shared with the Avelis website. Its Contact
			// and digest emails have no Cloud Mail outgoing record to update.
			// Only acknowledge this known external source; keep retrying unknown
			// missing records (including Cloud Mail send/persist races).
			const from = body.data.from;
			const subject = body.data.subject;
			const websiteSender = from === 'Avelis Notifications <notify@avelishq.com>';
			const websiteSubject = typeof subject === 'string' && (
				/^Avelis website — (?:concept-feedback|technology-operations|collaboration|other)$/.test(subject) ||
				/^Avelis (?:daily digest|每日申请汇总) — \d{4}-\d{2}-\d{2}$/.test(subject)
			);
			if (websiteSender && websiteSubject) return;
			throw new BizError('更新邮件状态记录失败');
		}

	}
}

export default resendService
