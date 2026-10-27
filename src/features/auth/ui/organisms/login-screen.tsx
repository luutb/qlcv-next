import { WorkhubIcon } from "@/components/atoms";
import { LoginForm } from "./login-form";

export function LoginScreen() {
  return <main id="main-content" className="auth-page">
    <section className="auth-story" aria-label="WorkHub">
      <div className="auth-brand"><span><WorkhubIcon name="grid" size={22} /></span>WorkHub</div>
      <div className="auth-story-copy"><span className="auth-story-label">Không gian cho đội ngũ của bạn</span><h2>Công việc rõ ràng.<br />Đội ngũ kết nối.</h2><p>Từ kế hoạch đến hoàn thành, giữ mọi công việc và trao đổi ở cùng một nơi.</p>
        <div className="auth-workflow" aria-label="Lên kế hoạch, thực hiện, hoàn thành"><div><WorkhubIcon name="folder" /><span>Lên kế hoạch</span></div><span className="auth-workflow-line" /><div><WorkhubIcon name="briefcase" /><span>Thực hiện</span></div><span className="auth-workflow-line" /><div><WorkhubIcon name="check" /><span>Hoàn thành</span></div></div>
      </div>
      <p className="auth-story-footer">Một nơi làm việc. Cùng một mục tiêu.</p>
    </section>
    <section className="auth-form-side" aria-labelledby="login-title">
      <div className="auth-mobile-brand"><WorkhubIcon name="grid" size={22} />WorkHub</div>
      <div className="auth-form-container"><span className="auth-form-label">Chào mừng trở lại</span><h1 id="login-title">Đăng nhập vào WorkHub</h1><p className="auth-intro">Sử dụng tài khoản của bạn để tiếp tục công việc.</p><LoginForm /><p className="auth-help">Chưa có tài khoản hoặc cần hỗ trợ?<br />Liên hệ quản trị viên của tổ chức.</p></div>
      <p className="auth-footer">Không gian làm việc dành riêng cho tổ chức của bạn.</p>
    </section>
  </main>;
}
