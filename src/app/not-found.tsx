import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <img src="/images/404-illustration.svg" alt="Not found illustration" className={styles.illustration} />
          <h1 className={styles.title}>Page Not Found</h1>
        </div>

        <p className={styles.description}>
          The page you are trying to visit does not exist or may have been moved.
        </p>

        <Link href="/dashboard" className={styles.backLink}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
