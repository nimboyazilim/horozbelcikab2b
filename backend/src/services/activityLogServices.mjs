import conMain from '../config/database.mjs';

const TABLE = 'cms_activity_logs';

class ActivityLogServices {
    async ensureTable() {
        const exists = await conMain.schema.hasTable(TABLE);
        if (!exists) {
            await conMain.schema.createTable(TABLE, (t) => {
                t.increments('id');
                t.string('user_id', 50).defaultTo('');
                t.string('user_name', 255).defaultTo('');
                t.string('user_email', 255).defaultTo('');
                t.text('action').notNullable();
                t.string('category', 100).defaultTo('');
                t.string('status', 20).defaultTo('basarili');
                t.text('error_message').nullable();
                t.timestamp('created_at').defaultTo(conMain.fn.now());
            });
        }
    }

    async createLog(req) {
        await this.ensureTable();
        const { user_id, user_name, user_email, action, category, status, error_message } = req.body;
        const [id] = await conMain(TABLE).insert({
            user_id: user_id || '',
            user_name: user_name || '',
            user_email: user_email || '',
            action: action || '',
            category: category || '',
            status: status || 'basarili',
            error_message: error_message || null,
        });
        return { id };
    }

    async getLogs(req) {
        await this.ensureTable();
        const { page = 1, limit = 500, category, status, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = conMain(TABLE).orderBy('created_at', 'desc');
        let countQuery = conMain(TABLE);

        if (category && category !== 'Tümü') {
            query = query.where('category', category);
            countQuery = countQuery.where('category', category);
        }
        if (status && status !== 'Tümü') {
            const statusVal = status === 'Başarılı' ? 'basarili' : 'basarisiz';
            query = query.where('status', statusVal);
            countQuery = countQuery.where('status', statusVal);
        }
        if (search) {
            const like = `%${search}%`;
            query = query.where(function () {
                this.where('action', 'like', like)
                    .orWhere('user_name', 'like', like)
                    .orWhere('user_email', 'like', like)
                    .orWhere('category', 'like', like);
            });
            countQuery = countQuery.where(function () {
                this.where('action', 'like', like)
                    .orWhere('user_name', 'like', like)
                    .orWhere('user_email', 'like', like)
                    .orWhere('category', 'like', like);
            });
        }

        const [{ total }] = await countQuery.count('id as total');
        const rows = await query.limit(parseInt(limit)).offset(offset);

        const logs = rows.map(l => ({
            id: String(l.id),
            timestamp: l.created_at instanceof Date ? l.created_at.toISOString() : String(l.created_at),
            userId: l.user_id,
            userName: l.user_name,
            userEmail: l.user_email,
            action: l.action,
            category: l.category,
            status: l.status,
            errorMessage: l.error_message || undefined,
        }));

        return { logs, total: Number(total) };
    }

    async clearLogs() {
        await this.ensureTable();
        await conMain(TABLE).delete();
        return { success: true };
    }
}

export default new ActivityLogServices();
