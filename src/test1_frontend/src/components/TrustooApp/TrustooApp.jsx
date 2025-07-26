import { useState, useEffect } from "react"
import "./TrustooApp.css"
import { test1_backend } from 'declarations/test1_backend';

export default function TrustooLanding() {
  const [currentPage, setCurrentPage] = useState("page1")
  const [amountInput, setAmountInput] = useState("")
  const [codeInput, setCodeInput] = useState("")
  const [attemptCount, setAttemptCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [generatedVerificationCode, setGeneratedVerificationCode] = useState("")
  const [lockTimer, setLockTimer] = useState(null)
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    // Initialize AOS-like animations
    const elements = document.querySelectorAll("[data-aos]")
    elements.forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(50px)"
      el.style.transition = "all 1.2s ease"
    })

    setTimeout(() => {
      elements.forEach((el) => {
        el.style.opacity = "1"
        el.style.transform = "translateY(0)"
      })
    }, 100)

    return () => {
      if (lockTimer) clearTimeout(lockTimer)
    }
  }, [lockTimer])

  const showPopup = (title, message, type = "info") => {
    setPopup({ title, message, type })
  }

  const closePopup = () => {
    setPopup(null)
  }

  const showPage = (pageId) => {
    setCurrentPage(pageId)
  }

  const showPage1 = () => {
    setCurrentPage("page1")
    setAmountInput("")
    setCodeInput("")
    setGeneratedVerificationCode("")
    setAttemptCount(0)
    setIsLocked(false)
    if (lockTimer) clearTimeout(lockTimer)
  }

  const showClientPage = () => {
    setCurrentPage("page2")
  }

  const showMerchantPage = () => {
    setCurrentPage("page3")
  }

    const generateCode = async () => {
        if (amountInput.trim() === "") {
            showPopup(
            "خطأ | Error",
            "يرجى إدخال المبلغ المطلوب تحويله | Please enter the amount to be transferred.",
            "error"
            )
            return
        }

        try {
            const code = await test1_backend.generate_code()
            setGeneratedVerificationCode(code)
            showPopup(
            "كود التحقق الخاص بك | Your Verification Code",
            `الكود: ${code}\n\nهام: لا تشارك هذا الكود مع أي شخص أو تنساه! | Important: Do not share this code with anyone or forget it!`,
            "warning"
            )
        } catch (err) {
            console.error("Error generating code:", err)
            showPopup("خطأ | Error", "حدث خطأ أثناء توليد الكود | An error occurred while generating the code.", "error")
        }
    }

    const verifyCode = async () => {
        if (isLocked) {
            showPopup(
            "انتظار | Please Wait",
            "الرجاء الانتظار 60 ثانية قبل المحاولة مجددًا | Please wait 60 seconds before trying again.",
            "warning"
            )
            return
        }

        const enteredCode = codeInput.trim().toUpperCase()
        if (enteredCode === "") {
            showPopup("خطأ | Error", "الرجاء إدخال الكود | Please enter the code.", "error")
            return
        }

        try {
            const isValid = await test1_backend.validate_code(enteredCode)
            if (isValid) {
            showPopup("نجاح | Success", "الكود مطابق! تمت العملية بنجاح وتم تحويل المبلغ.", "success")
            setAttemptCount(0)
            setGeneratedVerificationCode("")
            } else {
            const newAttemptCount = attemptCount + 1
            setAttemptCount(newAttemptCount)

            if (newAttemptCount >= 3) {
                setIsLocked(true)
                showPopup(
                "خطأ | Error",
                "الكود غير صحيح! تم الوصول للحد الأقصى للمحاولات. الرجاء الانتظار 60 ثانية قبل المحاولة مجددًا | Incorrect code! Maximum attempts reached. Please wait 60 seconds before trying again.",
                "error"
                )

                let timeLeft = 60
                const timer = setInterval(() => {
                timeLeft--
                if (timeLeft <= 0) {
                    clearInterval(timer)
                    setIsLocked(false)
                    setAttemptCount(0)
                    showPopup("جاهز | Ready", "يمكنك المحاولة مجددًا الآن | You can try again now.", "info")
                }
                }, 1000)
                setLockTimer(timer)
            } else {
                showPopup(
                "خطأ | Error",
                `الكود غير صحيح. (${newAttemptCount}/3 محاولات). يرجى المحاولة مرة أخرى. | Incorrect code. (${newAttemptCount}/3 attempts). Please try again.`,
                "error"
                )
            }
            }
        } catch (err) {
            console.error("Error validating code:", err)
            showPopup("خطأ | Error", "حدث خطأ أثناء التحقق من الكود | An error occurred during code validation.", "error")
        }
    }

  return (
    <div className="trustoo-app">
      {/* Background circles */}
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>

      {/* Site name */}
      <div className="site-name">Trustoo | للثقة عنوان</div>

      {/* Page 1: Welcome and role selection */}
      {currentPage === "page1" && (
        <div className="page-section" data-aos="zoom-in">
          <div className="welcome-hero">
            <h1>مرحبًا بكم في Trustoo</h1>
            <p>Welcome to Trustoo</p>
          </div>
          <div className="card" data-aos="fade-up">
            <h1>
              اختر دورك
              <br />
              <span style={{ fontSize: "0.8em", color: "#ccc" }}>Choose your role</span>
            </h1>
            <div className="selection-buttons">
              <button onClick={showClientPage}>
                أنا عميل
                <br />
                <span style={{ fontSize: "0.8em" }}>I am a Client</span>
              </button>
              <button onClick={showMerchantPage}>
                أنا تاجر
                <br />
                <span style={{ fontSize: "0.8em" }}>I am a Merchant</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page 2: Client page (amount input and code generation) */}
      {currentPage === "page2" && (
        <div className="page-section">
          <div className="container">
            <div className="card" data-aos="fade-up">
              <h1>
                إرسال دفعة
                <br />
                <span style={{ fontSize: "0.8em", color: "#ccc" }}>Send Payment</span>
              </h1>
              <label htmlFor="amountInput">ادخل المبلغ المطلوب تحويله | Enter Amount to be transferred</label>
              <input
                type="number"
                id="amountInput"
                placeholder="مثلاً: 150"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
              <button onClick={generateCode}>إنشاء كود التحقق | Generate Verification Code</button>
              <a onClick={showPage1} className="back-link">
                🔙 العودة للصفحة الرئيسية | Back to Home Page
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Page 3: Merchant page (code input and verification) */}
      {currentPage === "page3" && (
        <div className="page-section">
          <div className="container">
            <div className="card" data-aos="fade-up">
              <h1>
                التحقق من دفعة
                <br />
                <span style={{ fontSize: "0.8em", color: "#ccc" }}>Verify Payment</span>
              </h1>
              <label htmlFor="codeInput">ادخل الكود المطلوب | Enter the required Code</label>
              <input
                type="text"
                id="codeInput"
                placeholder="مثلاً: A1B2C3"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
              />
              <button onClick={verifyCode}>تحقق من الكود | Verify Code</button>
              <a onClick={showPage1} className="back-link">
                🔙 العودة للصفحة الرئيسية | Back to Home Page
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Why Trustoo section */}
      <div className="why-trustoo-section">
        <h2 data-aos="fade-down">
          ✨ ليه عملنا Trustoo
          <br />
          <span>Why we built Trustoo</span>
        </h2>
        <div className="boxes">
          <div className="box" data-aos="fade-right">
            <h3>سهولة الدفع</h3>
            <p>نسهل عمليات الدفع بين التاجر والمشتري مباشرةً.</p>
            <p>
              <em>Easy payment process between merchants and buyers.</em>
            </p>
          </div>
          <div className="box" data-aos="fade-up">
            <h3>أمان وموثوقية</h3>
            <p>نستخدم كود تحقق فريد لضمان الأمان.</p>
            <p>
              <em>Unique verification codes for more security.</em>
            </p>
          </div>
          <div className="box" data-aos="fade-left">
            <h3>دعم شامل</h3>
            <p>واجهة عربية وإنجليزية تناسب الجميع مع خطط للتطوير.</p>
            <p>
              <em>Arabic & English interface and future updates.</em>
            </p>
          </div>
          <div className="box" data-aos="fade-right">
            <h3>تطوير مستمر</h3>
            <p>نضيف مزايا جديدة بشكل تدريجي حسب احتياجات المستخدمين.</p>
            <p>
              <em>Continuous improvements based on user needs.</em>
            </p>
          </div>
          <div className="box" data-aos="fade-up">
            <h3>شفافية وأمان</h3>
            <p>وضحنا خطوات التطبيق وسياسات حماية البيانات.</p>
            <p>
              <em>Clear process and data protection policies.</em>
            </p>
          </div>
          <div className="box" data-aos="fade-left">
            <h3>مزايا إضافية</h3>
            <p>نخطط لإضافة تقييمات، تتبع الطلبات، ودعم فني.</p>
            <p>
              <em>Plans for reviews, order tracking, and support.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2
              style={{
                color:
                  popup.type === "success"
                    ? "#2ecc71"
                    : popup.type === "error"
                      ? "#e74c3c"
                      : popup.type === "warning"
                        ? "#f39c12"
                        : "#fdfd96",
              }}
            >
              {popup.title}
            </h2>
            <p style={{ whiteSpace: "pre-line" }}>{popup.message}</p>
            <button onClick={closePopup}>إغلاق | Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
