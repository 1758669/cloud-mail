// PostalMime structured Reply-To addresses, or the JSON stored in D1.
// Preserve From separately; invalid or unavailable Reply-To falls back at compose time.
const addressPattern=/^[a-zA-Z0-9!#$%&'*+/=?^_\x60{|}~.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
export function normalizeReplyTo(value) {
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return []; }
  }
  if (!Array.isArray(value)) return [];
  const result=[];
  const add=item=>{
    const raw=typeof item==='string'?item:item?.address;
    if (typeof raw!=='string'||/[\x00-\x1f\x7f]/.test(raw)) return;
    const address=raw.trim();
    if (address.length<=254&&addressPattern.test(address)&&!result.includes(address)) result.push(address);
  };
  for (const item of value) {
    if (Array.isArray(item?.group)) item.group.forEach(add);
    else add(item);
  }
  return result;
}
export function getReplyRecipients(email) {
  const recipients=normalizeReplyTo(email.replyTo);
  return recipients.length?recipients:[email.sendEmail];
}
