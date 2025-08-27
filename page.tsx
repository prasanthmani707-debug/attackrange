"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [server, setServer] = useState("");
  const [selectedAttack, setSelectedAttack] = useState("");
  const [status, setStatus] = useState("");
  const [openMain, setOpenMain] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const serverOptions = ["windows", "linux", "others"];

  const attackCategories: Record<string, string[]> = {
    "Brute Force Attack": [
      "Password Spraying (T1110.003)",
      "Password Cracking (T1110.001)",
      "Credential Stuffing (T1110.002)",
    ],
    "Application Attack": [
      "SQL Injection (T1190)",
      "Cross-site Scripting (T1059.007)",
      "Buffer Overflow (T1203)",
    ],
    "Command and Control Attack": [
      "Beaconing (T1071.001)",
      "Data Exfiltration (T1041)",
      "Remote Access Trojan (T1219)",
    ],
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMain(false);
        setOpenSub(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubAttackSelect = (attack: string) => {
    setSelectedAttack(attack);
    setOpenSub(null);
    setOpenMain(false);
  };

  const handleSubmit = async () => {
    if (!server || !selectedAttack) {
      alert("Please select both server and attack.");
      return;
    }
    const attackIdMatch = selectedAttack.match(/\((T\d+\.\d+|\w+)\)/);
    const attackId = attackIdMatch ? attackIdMatch[1] : selectedAttack;

    try {
      const res = await fetch(
        "https://gox1epxmg0.execute-api.sa-east-1.amazonaws.com/attack-range",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ server_type: server, attack_id: attackId }),
        }
      );
      const textResponse = await res.text();
      console.log("Response:", textResponse);
      setStatus(res.ok ? "success" : `fail - ${res.status}`);
    } catch (error) {
      console.error("Network Error:", error);
      setStatus("fail - network error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} ref={dropdownRef}>
        <h2 style={styles.title}>Attack Range API</h2>

        {/* Server Dropdown */}
        <div style={styles.row}>
          <label style={styles.label}>Server Name:</label>
          <select
            value={server}
            onChange={(e) => setServer(e.target.value)}
            style={styles.select}
          >
            <option value="">Select Server</option>
            {serverOptions.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>
        </div>

        {/* Attack Dropdown */}
        <div style={{ ...styles.row, position: "relative" }}>
          <label style={styles.label}>Attack Type:</label>
          <div style={{ position: "relative", flex: 1 }}>
            <button
              style={styles.dropdownButton}
              onClick={() => setOpenMain((prev) => !prev)}
            >
              {selectedAttack || "Select Attack Type"}
            </button>

            {openMain && (
              <div style={styles.dropdownMenu}>
                {Object.keys(attackCategories).map((category) => (
                  <div
                    key={category}
                    style={styles.dropdownItem}
                    onMouseEnter={() => setOpenSub(category)}
                    onMouseLeave={() => setOpenSub(null)}
                  >
                    {category}
                    {openSub === category && (
                      <div style={styles.subMenu}>
                        {attackCategories[category].map((attack) => (
                          <div
                            key={attack}
                            style={styles.subItem}
                            onClick={() => handleSubAttackSelect(attack)}
                          >
                            {attack}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleSubmit} style={styles.button}>
          Send
        </button>

        {status && (
          <p
            style={{
              ...styles.status,
              color: status.includes("success") ? "green" : "red",
            }}
          >
            {status === "success"
              ? "Request Successful!"
              : `Request Failed: ${status}`}
          </p>
        )}
      </div>
    </div>
  );
}

// Inline CSS Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f7f9fc",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "400px",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  label: {
    width: "120px",
    textAlign: "left",
    fontWeight: "500",
  },
  select: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  dropdownButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    background: "#f9f9f9",
    textAlign: "left",
    cursor: "pointer",
  },
  dropdownMenu: {
    position: "absolute",
    left: 0,
    marginTop: "2px",
    width: "100%",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    position: "relative",
    background: "white",
  },
  subMenu: {
    position: "absolute",
    left: "100%",
    top: 0,
    marginLeft: "2px",
    width: "250px",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  subItem: {
    padding: "10px",
    cursor: "pointer",
    background: "white",
  },
  button: {
    background: "#2563eb",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "bold",
    marginTop: "10px",
  },
  status: {
    marginTop: "15px",
    fontWeight: "bold",
  },
};
