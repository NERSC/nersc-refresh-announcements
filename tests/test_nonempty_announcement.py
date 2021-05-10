import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

# Assumes that the API_URL returns the following JSON when fetched:
'''
{
    user: 'rcthomas',
    announcement:
        'This is a test of the Jupyter announcement system. This is only a test. Here is a link to the <a href="https://www.nersc.gov/live-status/motd/">NERSC MOTD</a>.',
    timestamp: '2021-05-05T13:05:57.957231'
}
'''

class Test():
  def setup_method(self, method):
    self.driver = webdriver.Firefox()
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.quit()
  
  def wait_for_window(self, timeout = 2):
    time.sleep(round(timeout / 1000))
    wh_now = self.driver.window_handles
    wh_then = self.vars["window_handles"]
    if len(wh_now) > len(wh_then):
      return set(wh_now).difference(set(wh_then)).pop()
  
  def test(self):
    # open JupyerLab
    self.driver.get("localhost:8888/?token=53d187a13c16337acb036d7b16d3ae0aaa9cf4a095db580b")
    self.driver.implicitly_wait(10)

    # Give 60 seconds for the user to login
    WebDriverWait(self.driver, 60).until(
      expected_conditions.presence_of_element_located((By.XPATH, '//div[@class="lm-MenuBar-itemLabel p-MenuBar-itemLabel" and text()="File"]'))
    )

    # Wait for splash screen to go away
    time.sleep(3)
    
    # Make sure that announcements button is present, click it
    elem = self.driver.find_element_by_class_name("open-announcements")
    assert elem is not None
    assert elem.text == '⚠️ Click for Announcements'
    elem.click()

    # Make sure that the modal pops up with the right information
    elem = self.driver.find_element_by_xpath('//div[@class="lm-Widget p-Widget lm-Panel p-Panel jp-Dialog-content"]')
    assert elem is not None

    elem = self.driver.find_element_by_xpath('//div[@class="lm-Widget p-Widget jp-Dialog-header"]')
    assert elem.text == 'Announcements'

    elem = self.driver.find_element_by_xpath('//div[@class="lm-Widget p-Widget jp-Dialog-body"]')
    assert elem.text == 'This is a test of the Jupyter announcement system. This is only a test. Here is a link to the NERSC MOTD.'

    # Make sure the close button is present, click it
    elem = elem = self.driver.find_element_by_xpath('//div[@class="jp-Dialog-buttonLabel"]')
    assert elem.text == 'Close'
    elem = self.driver.find_element_by_xpath('//button[@class="jp-Dialog-button jp-mod-accept jp-mod-styled"]')
    assert elem is not None
    elem.click()

    # Make sure the modal went away
    self.driver.implicitly_wait(0)
    elems = self.driver.find_elements_by_xpath('//div[@class="lm-Widget p-Widget lm-Panel p-Panel jp-Dialog-content"]')
    assert len(elems) == 0

    # Make sure the announcements button changes to remove yellow warning
    elem = self.driver.find_element_by_class_name("open-announcements")
    assert elem is not None
    assert elem.text == 'Announcements'

    # Make sure the annoucements modal can be reopened
    elem.click()
    elem = self.driver.find_element_by_xpath('//div[@class="lm-Widget p-Widget lm-Panel p-Panel jp-Dialog-content"]')
    assert elem is not None
