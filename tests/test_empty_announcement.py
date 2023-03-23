import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.firefox.options import Options

# Assumes that the API_URL returns the following JSON when fetched:
'''
{}
'''

class Test():
  def setup_method(self, method):
    options = Options()
    options.add_argument("--headless")
    self.driver = webdriver.Firefox(options=options)
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.quit()
  
  def wait_for_window(self, timeout = 2):
    time.sleep(round(timeout / 1000))
    wh_now = self.driver.window_handles
    wh_then = self.vars["window_handles"]
    if len(wh_now) > len(wh_then):
      return set(wh_now).difference(set(wh_then)).pop()
  
  def test_file(self):
    # open JupyterLab
    self.driver.get("http://localhost:8888")
    self.driver.implicitly_wait(5)

    # Give 60 seconds for the user to login
    WebDriverWait(self.driver, 60).until(
      expected_conditions.presence_of_element_located((By.XPATH, '//div[@class="lm-MenuBar-itemLabel p-MenuBar-itemLabel" and text()="File"]'))
    )

    # Wait for splash screen to go away
    time.sleep(3)
    
    # Make sure that announcements button is not present
    elems = self.driver.find_elements(By.CLASS_NAME, "open-announcements")
    assert len(elems) == 0
