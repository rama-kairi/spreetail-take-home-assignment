// Mock data for UI development

export interface UploadedFile {
	id: string;
	fileName: string;
	status: "processing" | "completed" | "error";
	totalThreads: number;
	processedThreads: number;
	uploadedAt: Date;
	progress?: number;
}

export interface Thread {
	thread_id: string;
	topic: string;
	subject: string;
	initiated_by: "customer" | "company";
	order_id: string;
	product: string;
	messages: Message[];
	summary?: Summary;
}

export interface Message {
	id: string;
	sender: "customer" | "company";
	timestamp: string;
	body: string;
}

export interface Summary {
	id: string;
	thread_id: string;
	original_summary: string;
	edited_summary: string | null;
	status: "pending" | "approved" | "rejected";
	approved_by: string | null;
	approved_at: string | null;
	created_at: string;
	updated_at: string;
}

// Mock uploaded files
export const mockFiles: UploadedFile[] = [
	{
		id: "file-1",
		fileName: "ce_exercise_threads.json",
		status: "completed",
		totalThreads: 10,
		processedThreads: 10,
		uploadedAt: new Date("2025-09-15T10:30:00"),
	},
	{
		id: "file-2",
		fileName: "customer_threads_2025.json",
		status: "processing",
		totalThreads: 8,
		processedThreads: 3,
		uploadedAt: new Date("2025-09-15T11:00:00"),
		progress: 37.5,
	},
];

// Mock threads - Using actual data from ce_exercise_threads.json
export const mockThreads: Thread[] = [
	{
		thread_id: "CE-405467-683",
		topic: "Damaged product on arrival",
		subject: "Order 405467-683: Damaged item received",
		initiated_by: "customer",
		order_id: "405467-683",
		product: "LED Monitor",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-09-12T06:39:29",
				body: "Hello, my item arrived damaged. Order 405467-683 LED Monitor. Pending confirm photos question credit 7732 tracking broken packaging stock status order.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-09-12T06:49:29",
				body: "Please decline 3206 stock when reroute delivery help 3580 summary size delayed warehouse address tomorrow credit today credit decline size please summary photos why policy.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-09-12T06:59:29",
				body: "Broken 2965 color 4739.",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-09-12T07:09:29",
				body: "Today hello warehouse arrived today delivery decline color tomorrow.",
			},
			{
				id: "m5",
				sender: "customer",
				timestamp: "2025-09-12T07:19:29",
				body: "8026 address please arrived refund card return issue.",
			},
			{
				id: "m6",
				sender: "company",
				timestamp: "2025-09-12T07:29:29",
				body: "Resolved arrived carrier stuck urgent decline credit delivery size when routing routing refund refund sorry approve stock today address size when summary 1513 defective return lost. Order 405467-683 LED Monitor.",
			},
			{
				id: "m7",
				sender: "customer",
				timestamp: "2025-09-12T07:39:29",
				body: "Tomorrow wrong return where 9907 delivery photos delayed update arrived address approve resolved 4090 where order address 6529 refund policy packaging lost arrived issue number ticket ticket warehouse size photos refund order response routing reroute response refund response question lost 1640 question wrong return approve.",
			},
			{
				id: "m8",
				sender: "company",
				timestamp: "2025-09-12T07:49:29",
				body: "When color help color arrived routing routing address 3047 urgent update number response issue 2566 delayed policy 7935 urgent order status 9023 policy 6078 packaging 3063 why defective urgent number 7989 status urgent 7836 today size routing please please tracking issue partial stuck 277. Order 405467-683 LED Monitor.",
			},
		],
		summary: {
			id: "sum-1",
			thread_id: "CE-405467-683",
			original_summary:
				"Issue Summary:\nCustomer received a damaged LED Monitor (Order 405467-683). The item arrived with physical damage to the packaging and product.\n\nKey Details:\n- Order ID: 405467-683\n- Product: LED Monitor\n- Issue Type: Physical damage\n- Customer Concern: Broken item received\n\nResolution Status: Pending\n\nAction Items:\n- Process refund request\n- Update customer on resolution",
			edited_summary: null,
			status: "pending",
			approved_by: null,
			approved_at: null,
			created_at: "2025-09-15T10:35:00",
			updated_at: "2025-09-15T10:35:00",
		},
	},
	{
		thread_id: "CE-681480-462",
		topic: "Late delivery inquiry",
		subject: "Order 681480-462: Where is my order?",
		initiated_by: "customer",
		order_id: "681480-462",
		product: "LED Monitor",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-08-28T10:39:29",
				body: "Hello, my shipment is delayed. Order 681480-462 LED Monitor. Card 5190 status where pending.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-08-28T10:49:29",
				body: "Wrong size how urgent.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-08-28T10:59:29",
				body: "Where please how size where tomorrow refund replacement resolved warehouse confirm wrong tracking size packaging routing sorry 267 when attached attached replacement 1905 attached credit sorry 2784 hello address carrier urgent return partial tracking urgent carrier delayed routing.",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-08-28T11:09:29",
				body: "Address status 174 question stock color address ticket.",
			},
			{
				id: "m5",
				sender: "customer",
				timestamp: "2025-08-28T11:19:29",
				body: "Delayed.",
			},
			{
				id: "m6",
				sender: "company",
				timestamp: "2025-08-28T11:29:29",
				body: "Packaging photos attached color why 6959 approve lost please please reroute stuck how size card carrier address sorry please delivery status order thanks credit return arrived packaging card response return question decline carrier card case 4388 resolved response thanks 1165 case reroute 8997 when question tracking tomorrow decline tomorrow.",
			},
			{
				id: "m7",
				sender: "customer",
				timestamp: "2025-08-28T11:39:29",
				body: "Size policy update 2408 size photos sorry pending 4562 ticket 4548 when please policy summary case credit warehouse help reroute delivery delayed status 5177 question pending tracking response case photos issue sorry hello why 446 pending 5725 6237 9811 response attached where refund when confirm 2342 card sorry 6621.",
			},
		],
		summary: {
			id: "sum-2",
			thread_id: "CE-681480-462",
			original_summary:
				"Issue Summary:\nCustomer inquiring about delayed shipment for Order 681480-462 (LED Monitor).\n\nKey Details:\n- Order ID: 681480-462\n- Product: LED Monitor\n- Issue Type: Delivery delay\n- Customer Concern: Shipment status inquiry\n\nResolution Status: Pending\n\nAction Items:\n- Provide tracking update\n- Investigate delivery delay",
			edited_summary: null,
			status: "pending",
			approved_by: null,
			approved_at: null,
			created_at: "2025-09-15T10:40:00",
			updated_at: "2025-09-15T10:40:00",
		},
	},
	{
		thread_id: "CE-762448-617",
		topic: "Wrong color/size variant",
		subject: "Order 762448-617: Wrong variant received",
		initiated_by: "customer",
		order_id: "762448-617",
		product: "Vacuum Cleaner",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-08-20T08:39:29",
				body: "I received the wrong color or size. Order 762448-617 Vacuum Cleaner. Why packaging thanks.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-08-20T08:49:29",
				body: "Delayed why attached how.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-08-20T08:59:29",
				body: "Return.",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-08-20T09:09:29",
				body: "Credit arrived how today partial arrived card refund 7770 8190 refund policy reroute pending hello resolved wrong 6465 packaging thanks delayed partial color issue 1436 policy resolved carrier pending where stuck return summary arrived number hello.",
			},
			{
				id: "m5",
				sender: "customer",
				timestamp: "2025-08-20T09:19:29",
				body: "Attached 1909 why return carrier warehouse arrived 1186 carrier size 2489 when policy pending reroute color attached pending packaging 5675 case tracking card refund credit status question number tracking hello refund color decline refund warehouse reroute color lost wrong approve 4661 routing carrier partial photos.",
			},
			{
				id: "m6",
				sender: "company",
				timestamp: "2025-08-20T09:29:29",
				body: "Replacement replacement resolved lost delayed stock when 8630 question status order number.",
			},
			{
				id: "m7",
				sender: "customer",
				timestamp: "2025-08-20T09:39:29",
				body: "Photos partial arrived pending refund response urgent address response 3773 arrived how arrived update help refund carrier sorry delivery wrong issue how 3395 defective when where today issue warehouse delayed broken update 5778 7226 refund approve approve pending 8787.",
			},
		],
		summary: {
			id: "sum-3",
			thread_id: "CE-762448-617",
			original_summary:
				"Issue Summary:\nCustomer received wrong color or size variant for Order 762448-617 (Vacuum Cleaner).\n\nKey Details:\n- Order ID: 762448-617\n- Product: Vacuum Cleaner\n- Issue Type: Wrong variant\n- Customer Concern: Incorrect product variant received\n\nResolution Status: Pending",
			edited_summary: null,
			status: "approved",
			approved_by: "user@example.com",
			approved_at: "2025-09-15T09:00:00",
			created_at: "2025-09-15T08:50:00",
			updated_at: "2025-09-15T09:00:00",
		},
	},
	{
		thread_id: "CE-627506-327",
		topic: "Return/refund request",
		subject: "Order 627506-327: Return or refund request",
		initiated_by: "customer",
		order_id: "627506-327",
		product: "Headphones",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-08-21T10:39:29",
				body: "I want to return this item and request a refund. Order 627506-327 Headphones. Issue warehouse refund attached replacement delayed approve.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-08-21T10:49:29",
				body: "Question number refund case card delivery arrived confirm delivery tomorrow decline lost stock defective broken return update card 8601.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-08-21T10:59:29",
				body: "Routing ticket 6192 8790 where defective address stuck partial credit 9344 size where ticket hello credit stuck attached tomorrow carrier please delayed 8284 urgent where attached approve response refund sorry when card summary update stuck return refund.",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-08-21T11:09:29",
				body: "Packaging return 8852 card partial defective 8247 please packaging warehouse size 2152 6158 how ticket refund pending photos 9340 ticket 4157 update.",
			},
			{
				id: "m5",
				sender: "customer",
				timestamp: "2025-08-21T11:19:29",
				body: "Carrier return 922 color 7474 response.",
			},
			{
				id: "m6",
				sender: "company",
				timestamp: "2025-08-21T11:29:29",
				body: "Tomorrow 6679 today photos routing 4367 issue 3737 7144 sorry update arrived update 8171 hello question defective stuck hello carrier defective.",
			},
		],
		summary: {
			id: "sum-4",
			thread_id: "CE-627506-327",
			original_summary:
				"Issue Summary:\nCustomer requesting return and refund for Order 627506-327 (Headphones).\n\nKey Details:\n- Order ID: 627506-327\n- Product: Headphones\n- Issue Type: Return/refund request\n- Customer Concern: Wants to return item and get refund\n\nResolution Status: Pending\n\nAction Items:\n- Process return request\n- Initiate refund process",
			edited_summary: null,
			status: "pending",
			approved_by: null,
			approved_at: null,
			created_at: "2025-09-15T10:45:00",
			updated_at: "2025-09-15T10:45:00",
		},
	},
	{
		thread_id: "CE-928163-566",
		topic: "Outbound: address confirmation confusion",
		subject: "Action required: confirm your address for Order 928163-566",
		initiated_by: "company",
		order_id: "928163-566",
		product: "Vacuum Cleaner",
		messages: [
			{
				id: "m1",
				sender: "company",
				timestamp: "2025-08-20T22:39:29",
				body: "Hello, we need to confirm your shipping address for Order 928163-566. Warehouse address 5323 wrong broken broken broken.",
			},
			{
				id: "m2",
				sender: "customer",
				timestamp: "2025-08-20T22:49:29",
				body: "I'm confused about which address you have on file Thanks hello sorry tracking carrier carrier packaging policy 8898 ticket replacement defective routing confirm.",
			},
			{
				id: "m3",
				sender: "company",
				timestamp: "2025-08-20T22:59:29",
				body: "Resolved 8598 address sorry response wrong address status issue size policy 8559 refund issue help sorry pending thanks 6046 ticket 7629 decline address broken defective credit 7863 return resolved issue why issue refund resolved when 8972 thanks lost refund please where summary wrong replacement thanks packaging question attached address.",
			},
			{
				id: "m4",
				sender: "customer",
				timestamp: "2025-08-20T23:09:29",
				body: "Refund 7979 defective hello response broken carrier decline stock stock resolved reroute sorry today approve.",
			},
			{
				id: "m5",
				sender: "company",
				timestamp: "2025-08-20T23:19:29",
				body: "Routing status.",
			},
			{
				id: "m6",
				sender: "customer",
				timestamp: "2025-08-20T23:29:29",
				body: "Case 1543 reroute lost color replacement address.",
			},
			{
				id: "m7",
				sender: "company",
				timestamp: "2025-08-20T23:39:29",
				body: "Case pending return help delivery 6463 ticket 2411 broken return wrong when thanks when delayed resolved how 3496 replacement delayed address delivery policy policy reroute size 2171 refund today broken size 3288 refund credit arrived packaging help approve case number refund replacement stock delayed order 5643 why card.",
			},
		],
		summary: {
			id: "sum-5",
			thread_id: "CE-928163-566",
			original_summary:
				"Issue Summary:\nCompany-initiated address confirmation request for Order 928163-566 (Vacuum Cleaner). Customer confused about which address is on file.\n\nKey Details:\n- Order ID: 928163-566\n- Product: Vacuum Cleaner\n- Issue Type: Address confirmation confusion\n- Initiated By: Company\n- Customer Concern: Confusion about shipping address\n\nResolution Status: Pending\n\nAction Items:\n- Clarify correct shipping address\n- Update order with confirmed address",
			edited_summary: null,
			status: "pending",
			approved_by: null,
			approved_at: null,
			created_at: "2025-09-15T10:50:00",
			updated_at: "2025-09-15T10:50:00",
		},
	},
	{
		thread_id: "CE-123456-789",
		topic: "Product quality issue",
		subject: "Order 123456-789: Product not working as expected",
		initiated_by: "customer",
		order_id: "123456-789",
		product: "Wireless Mouse",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-09-10T14:20:00",
				body: "Hello, I received my wireless mouse but it's not connecting properly. Order 123456-789. The device keeps disconnecting every few minutes which makes it unusable.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-09-10T14:35:00",
				body: "Thank you for contacting us. We apologize for the inconvenience. Please try resetting the mouse by holding the connect button for 5 seconds. If the issue persists, we can arrange a replacement.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-09-10T15:00:00",
				body: "I tried resetting it multiple times but it still disconnects. I need a replacement or refund please.",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-09-10T15:15:00",
				body: "We understand your frustration. We'll process a replacement order for you right away. You should receive a new mouse within 3-5 business days. Please keep the defective unit as we'll arrange pickup.",
			},
		],
		summary: {
			id: "sum-6",
			thread_id: "CE-123456-789",
			original_summary:
				"Issue Summary:\nCustomer reporting connectivity issues with Wireless Mouse (Order 123456-789). Device keeps disconnecting frequently.\n\nKey Details:\n- Order ID: 123456-789\n- Product: Wireless Mouse\n- Issue Type: Product quality/functionality\n- Customer Concern: Device unusable due to frequent disconnections\n\nResolution Status: Pending\n\nAction Items:\n- Process replacement order\n- Arrange pickup for defective unit",
			edited_summary: null,
			status: "pending",
			approved_by: null,
			approved_at: null,
			created_at: "2025-09-15T11:00:00",
			updated_at: "2025-09-15T11:00:00",
		},
	},
	{
		thread_id: "CE-987654-321",
		topic: "Billing inquiry",
		subject: "Order 987654-321: Charge discrepancy",
		initiated_by: "customer",
		order_id: "987654-321",
		product: "Gaming Keyboard",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-09-08T09:15:00",
				body: "I was charged twice for my order. Order 987654-321 Gaming Keyboard. I see two charges on my credit card statement for the same amount. Please investigate and refund one of them.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-09-08T09:30:00",
				body: "We apologize for the confusion. Let me check your order and payment records. I'll investigate this immediately and get back to you within 24 hours.",
			},
			{
				id: "m3",
				sender: "company",
				timestamp: "2025-09-08T16:45:00",
				body: "Thank you for your patience. I've reviewed your account and found that one charge was a pre-authorization that should have been released. We've processed the refund which should appear in your account within 5-7 business days.",
			},
			{
				id: "m4",
				sender: "customer",
				timestamp: "2025-09-09T10:00:00",
				body: "Thank you for resolving this quickly. I appreciate your help.",
			},
		],
		summary: {
			id: "sum-7",
			thread_id: "CE-987654-321",
			original_summary:
				"Issue Summary:\nCustomer reporting duplicate charge for Order 987654-321 (Gaming Keyboard). Two identical charges appeared on credit card.\n\nKey Details:\n- Order ID: 987654-321\n- Product: Gaming Keyboard\n- Issue Type: Billing discrepancy\n- Customer Concern: Duplicate charge\n\nResolution Status: Resolved\n\nAction Items:\n- Refund processed for duplicate charge\n- Customer notified of refund timeline",
			edited_summary: null,
			status: "approved",
			approved_by: "support@example.com",
			approved_at: "2025-09-15T11:05:00",
			created_at: "2025-09-15T11:00:00",
			updated_at: "2025-09-15T11:05:00",
		},
	},
	{
		thread_id: "CE-555666-777",
		topic: "Missing item from order",
		subject: "Order 555666-777: Item missing from package",
		initiated_by: "customer",
		order_id: "555666-777",
		product: "USB-C Cable",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-09-05T11:20:00",
				body: "I ordered a USB-C cable but it wasn't in the package. Order 555666-777. I received the other items but the cable is missing.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-09-05T11:40:00",
				body: "We're sorry to hear that. Can you please check if the cable might be in a separate package? Sometimes items ship separately. If not, we'll send a replacement immediately.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-09-05T12:00:00",
				body: "I checked and there's only one package. No cable inside. I need it urgently for work.",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-09-05T12:15:00",
				body: "We understand the urgency. We've shipped a replacement cable via express delivery. You should receive it tomorrow. We've also added a tracking number to your account.",
			},
			{
				id: "m5",
				sender: "customer",
				timestamp: "2025-09-06T14:00:00",
				body: "Received the replacement cable today. Thank you for the quick resolution!",
			},
		],
		summary: {
			id: "sum-8",
			thread_id: "CE-555666-777",
			original_summary:
				"Issue Summary:\nCustomer reporting missing USB-C Cable from Order 555666-777. Item not found in received package.\n\nKey Details:\n- Order ID: 555666-777\n- Product: USB-C Cable\n- Issue Type: Missing item\n- Customer Concern: Urgent need for work\n\nResolution Status: Resolved\n\nAction Items:\n- Replacement shipped via express delivery\n- Customer confirmed receipt",
			edited_summary: null,
			status: "approved",
			approved_by: "support@example.com",
			approved_at: "2025-09-15T11:10:00",
			created_at: "2025-09-15T11:05:00",
			updated_at: "2025-09-15T11:10:00",
		},
	},
	{
		thread_id: "CE-111222-333",
		topic: "Cancellation request",
		subject: "Order 111222-333: Cancel my order",
		initiated_by: "customer",
		order_id: "111222-333",
		product: "Laptop Stand",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-09-03T08:30:00",
				body: "I want to cancel my order. Order 111222-333 Laptop Stand. I found a better deal elsewhere. Please cancel and refund.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-09-03T08:45:00",
				body: "I've checked your order status. Unfortunately, your order has already been shipped and is in transit. Once you receive it, you can return it for a full refund within 30 days.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-09-03T09:00:00",
				body: "That's frustrating. Can you at least stop the shipment or redirect it back?",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-09-03T09:15:00",
				body: "I understand your frustration. Unfortunately, once a package is in transit, we cannot intercept it. However, you can refuse delivery when it arrives, and it will be returned to us automatically. We'll process your refund once we receive it back.",
			},
		],
		summary: {
			id: "sum-9",
			thread_id: "CE-111222-333",
			original_summary:
				"Issue Summary:\nCustomer requesting cancellation of Order 111222-333 (Laptop Stand). Order already shipped.\n\nKey Details:\n- Order ID: 111222-333\n- Product: Laptop Stand\n- Issue Type: Cancellation request\n- Customer Concern: Found better deal elsewhere\n\nResolution Status: Pending\n\nAction Items:\n- Customer advised to refuse delivery\n- Refund will be processed upon return receipt",
			edited_summary: null,
			status: "pending",
			approved_by: null,
			approved_at: null,
			created_at: "2025-09-15T11:15:00",
			updated_at: "2025-09-15T11:15:00",
		},
	},
	{
		thread_id: "CE-444555-666",
		topic: "Warranty claim",
		subject: "Order 444555-666: Product stopped working",
		initiated_by: "customer",
		order_id: "444555-666",
		product: "External Hard Drive",
		messages: [
			{
				id: "m1",
				sender: "customer",
				timestamp: "2025-08-25T13:00:00",
				body: "My external hard drive stopped working after 8 months. Order 444555-666. It's still under warranty. I need a replacement or repair.",
			},
			{
				id: "m2",
				sender: "company",
				timestamp: "2025-08-25T13:20:00",
				body: "We're sorry to hear about the issue. Since it's under warranty, we can help. Please provide the serial number and a brief description of what happened. We'll process your warranty claim.",
			},
			{
				id: "m3",
				sender: "customer",
				timestamp: "2025-08-25T14:00:00",
				body: "Serial number: HD-2024-789456. It just stopped being recognized by my computer one day. No physical damage, just stopped working.",
			},
			{
				id: "m4",
				sender: "company",
				timestamp: "2025-08-25T14:30:00",
				body: "Thank you for the information. Your warranty claim has been approved. We'll send you a replacement unit and a prepaid return label for the defective drive. You should receive the replacement within 5-7 business days.",
			},
			{
				id: "m5",
				sender: "customer",
				timestamp: "2025-09-02T10:00:00",
				body: "Received the replacement drive. Working perfectly. Thank you for honoring the warranty!",
			},
		],
		summary: {
			id: "sum-10",
			thread_id: "CE-444555-666",
			original_summary:
				"Issue Summary:\nCustomer reporting External Hard Drive failure after 8 months (Order 444555-666). Product still under warranty.\n\nKey Details:\n- Order ID: 444555-666\n- Product: External Hard Drive\n- Issue Type: Warranty claim\n- Customer Concern: Device stopped working, no physical damage\n\nResolution Status: Resolved\n\nAction Items:\n- Warranty claim approved\n- Replacement shipped\n- Customer confirmed receipt and satisfaction",
			edited_summary: null,
			status: "approved",
			approved_by: "warranty@example.com",
			approved_at: "2025-09-15T11:20:00",
			created_at: "2025-09-15T11:15:00",
			updated_at: "2025-09-15T11:20:00",
		},
	},
	{
		thread_id: "CE-777888-999",
		topic: "Outbound: product recall notice",
		subject: "Important: Product recall for Order 777888-999",
		initiated_by: "company",
		order_id: "777888-999",
		product: "Power Bank",
		messages: [
			{
				id: "m1",
				sender: "company",
				timestamp: "2025-09-01T10:00:00",
				body: "Important Safety Notice: We're contacting you regarding your Power Bank purchase (Order 777888-999). We've identified a potential safety issue with this batch and are initiating a voluntary recall. Please stop using the product immediately.",
			},
			{
				id: "m2",
				sender: "customer",
				timestamp: "2025-09-01T11:30:00",
				body: "This is concerning. What's the safety issue? I've been using it daily. Should I be worried?",
			},
			{
				id: "m3",
				sender: "company",
				timestamp: "2025-09-01T12:00:00",
				body: "The issue involves potential overheating during charging. While no incidents have been reported, we're taking proactive measures. We'll provide a full refund or replacement. Please return the unit using the prepaid label we'll send, and we'll process your refund immediately.",
			},
			{
				id: "m4",
				sender: "customer",
				timestamp: "2025-09-01T13:00:00",
				body: "Thank you for being proactive. I'll return it right away. I'd prefer a replacement if possible.",
			},
			{
				id: "m5",
				sender: "company",
				timestamp: "2025-09-01T13:15:00",
				body: "Perfect. We'll send you a replacement unit from a different batch once we receive your return. The prepaid return label has been emailed to you. Thank you for your cooperation.",
			},
		],
		summary: {
			id: "sum-11",
			thread_id: "CE-777888-999",
			original_summary:
				"Issue Summary:\nCompany-initiated product recall for Power Bank (Order 777888-999). Potential safety issue identified.\n\nKey Details:\n- Order ID: 777888-999\n- Product: Power Bank\n- Issue Type: Product recall (safety concern)\n- Initiated By: Company\n- Customer Concern: Safety and replacement\n\nResolution Status: Pending\n\nAction Items:\n- Customer to return product\n- Replacement to be sent from different batch\n- Prepaid return label provided",
			edited_summary: null,
			status: "pending",
			approved_by: null,
			approved_at: null,
			created_at: "2025-09-15T11:25:00",
			updated_at: "2025-09-15T11:25:00",
		},
	},
];
